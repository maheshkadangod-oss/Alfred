// Real-looking code for the "code rain" in the hero. Each snippet is the kind of thing behind
// one of Alfred's projects. Highlighted at build time, so the page ships plain HTML.

export const snippets = [
  // GoZip: Rails model for a move job
  `class Move < ApplicationRecord
  belongs_to :company
  belongs_to :customer
  has_many :crew_assignments, dependent: :destroy
  has_many :crew, through: :crew_assignments, source: :user

  enum :status, { lead: 0, quoted: 1, booked: 2, in_progress: 3, done: 4 }

  validates :pickup_at, :origin, :destination, presence: true
  scope :today, -> { where(pickup_at: Time.zone.today.all_day) }

  after_commit :notify_crew, if: :saved_change_to_pickup_at?

  def total_cents
    hourly_rate_cents * billable_hours + materials_cents
  end

  private

  def notify_crew
    CrewSmsJob.perform_later(id)
  end
end`,
  // GoZip: Sidekiq job sending SMS through Twilio
  `class CrewSmsJob
  include Sidekiq::Job
  sidekiq_options queue: :notifications, retry: 5

  def perform(move_id)
    move = Move.includes(:crew).find(move_id)
    move.crew.each do |member|
      twilio.messages.create(
        from: ENV.fetch("TWILIO_FROM"),
        to: member.phone,
        body: "Job #\#{move.id}: \#{move.origin} at \#{move.pickup_at.strftime('%-l:%M %p')}"
      )
    end
  end

  private

  def twilio
    @twilio ||= Twilio::REST::Client.new
  end
end`,
  // SmashPOS: Convex mutation that places an order
  `export const placeOrder = mutation({
  args: {
    storeId: v.id("stores"),
    items: v.array(v.object({ itemId: v.id("menuItems"), qty: v.number() })),
    table: v.optional(v.string()),
  },
  handler: async (ctx, { storeId, items, table }) => {
    let total = 0;
    for (const line of items) {
      const item = await ctx.db.get(line.itemId);
      if (!item || !item.available) throw new Error("Item unavailable");
      total += item.price * line.qty;
    }
    const orderId = await ctx.db.insert("orders", {
      storeId, items, table, total, status: "kitchen", createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.printer.kot, { orderId });
    return orderId;
  },
});`,
  // PayLens: Python payout parser
  `def parse_payout(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path, sheet_name="Order Level")
    df = df.rename(columns=str.lower)
    df["commission"] = df["commission_amount"] + df["commission_gst"]
    df["ads"] = df["ads_deduction"].fillna(0)
    df["discount"] = df["restaurant_discount"].fillna(0)
    df["net"] = (
        df["order_value"] - df["commission"] - df["ads"] - df["discount"]
    )
    return df.groupby(df["order_date"].dt.isocalendar().week).agg(
        orders=("order_id", "count"),
        gross=("order_value", "sum"),
        net=("net", "sum"),
    )`,
  // GoZip web: React dispatch board
  `export function DispatchBoard({ date }) {
  const { data: moves = [] } = useQuery({
    queryKey: ["moves", date],
    queryFn: () => api.get(\`/moves?date=\${date}\`),
    refetchInterval: 15_000,
  });
  const byTruck = groupBy(moves, (m) => m.truckId);

  return (
    <Board>
      {Object.entries(byTruck).map(([truckId, jobs]) => (
        <Lane key={truckId} truck={truckId}>
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </Lane>
      ))}
    </Board>
  );
}`,
  // Ledgr / reporting: Postgres
  `SELECT s.name AS store,
       date_trunc('week', o.created_at) AS week,
       count(*) AS orders,
       sum(o.total) / 100.0 AS revenue,
       sum(e.amount) / 100.0 AS expenses
FROM orders o
JOIN stores s ON s.id = o.store_id
LEFT JOIN expenses e
  ON e.store_id = s.id
 AND date_trunc('week', e.spent_on) = date_trunc('week', o.created_at)
WHERE o.created_at >= now() - interval '12 weeks'
GROUP BY 1, 2
ORDER BY 2 DESC, 1;`,
]

const KEYWORDS = /\b(class|def|end|do|if|else|return|const|let|for|of|await|async|export|function|import|from|private|include|belongs_to|has_many|validates|scope|enum|after_commit|throw|new|SELECT|FROM|JOIN|LEFT|ON|AND|WHERE|GROUP BY|ORDER BY|AS|DESC|interval)\b/g
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// very small highlighter: comments, strings, keywords, numbers
export function highlight(code) {
  return code.split('\n').map((line) => {
    let out = esc(line)
    out = out.replace(/(&quot;|"[^"]*"|'[^']*'|`[^`]*`)/g, '<em>$1</em>')
    out = out.replace(KEYWORDS, '<b>$1</b>')
    out = out.replace(/(:[a-z_]+)/g, '<u>$1</u>')
    return out || ' '
  }).join('\n')
}

# Staff Review Rubric

Six dimensions for evaluating technical decisions from a Staff Engineer perspective. Used by `/staff-review` skill.

## 1. Problem Decomposition

**What it is:** Does the design correctly identify and scope the actual problem?

**Questions to ask:**
- Is the right problem being solved (not a symptom)?
- Is the scope bounded and achievable?
- Are constraints explicit (scale, latency, consistency, cost)?
- Has the design been sized against the constraints?

**What good looks like:**
- Problem statement is specific: "handle 1M concurrent users, <100ms p99 latency"
- Scope is bounded: "this covers the checkout flow, not the recommendation engine"
- Constraints are acknowledged: "we're optimizing for simplicity over absolute performance"

**Red flags:**
- Vague problem statement: "make it faster", "improve scalability"
- Hidden constraints: "we need this to work offline" mentioned in passing
- Overscoping: trying to solve every possible future problem
- No discussion of what's explicitly out of scope

**Growth area questions:**
- "What's the constraint that drove this particular architecture?"
- "What problem are you NOT solving here, and why?"
- "How did you size this against actual load?"

## 2. Design Trade-offs

**What it is:** Are trade-offs explicit and reasoned, or hidden and assumed?

**Questions to ask:**
- What was chosen? What was rejected?
- Why was the chosen approach preferred?
- What's the cost/risk of the rejected alternatives?
- What future pain does this choice trade away?

**What good looks like:**
- "We chose PostgreSQL over DynamoDB because we need ACID guarantees. Downside: harder to scale horizontally, but our load fits one server."
- "We're building the cache in Redis instead of in-process because we need multi-service consistency. Downside: added latency, complexity, operational burden."
- "Honest about the bet": decisions are never objectively correct, only contextually reasonable

**Red flags:**
- Decisions presented as obviously correct ("SQL is better than NoSQL")
- Unexamined assumptions ("we should use microservices")
- Dismissed alternatives: "X is bad" without reasoning
- Hiding costs: "it's simple to set up" (but hard to operate)

**Growth area questions:**
- "What made you choose this over [alternative]?"
- "What are the downsides of your approach?"
- "What would change your mind about this choice?"
- "If this assumption breaks in 6 months, what's your backup?"

## 3. Scalability Reasoning

**What it is:** Does the engineer reason correctly about scale — when it matters, when it doesn't, and what's the actual bottleneck?

**Questions to ask:**
- Is scalability a real constraint or premature optimization?
- Does the design correctly identify the bottleneck?
- Are scaling decisions proportional to actual load?
- How does the design handle growth?

**What good looks like:**
- "We don't need horizontal scaling until we hit 5M requests/day, which is 18 months away at current growth."
- "The bottleneck is the database, not the application servers, so we're focusing on query optimization first."
- "We're using sharding, but only across 3 partitions for now. We can add more without re-architecting."

**Red flags:**
- Scaling for 10M users when you have 1K
- Not investigating actual bottlenecks (assuming the obvious is the problem)
- Scaling the wrong layer (caching when the issue is database joins)
- False confidence: "this will scale to 100M users" (but no actual testing or math)

**Growth area questions:**
- "Have you profiled at actual load to confirm this is the bottleneck?"
- "What's the growth trajectory you're optimizing for?"
- "At what load does this design break?"
- "What's the cost of horizontal scaling here?"

## 4. Technology Choices

**What it is:** Are libraries, frameworks, and architectural patterns chosen for the right reasons?

**Questions to ask:**
- Why this library/framework (not alternatives)?
- Is it fit-for-purpose (solving the actual problem)?
- Is it actively maintained?
- Does it match the team's expertise?
- What's the switching cost if it doesn't work out?

**What good looks like:**
- "We chose React because we need reactivity without a full backend framework. Vue would work too, but the team knows React better."
- "We're using gRPC instead of REST because we have 50+ internal services and need strong typing across boundaries."
- "This is a new internal tool, so we picked the team's favorite stack even though it's not the most mature choice — trade-off is acceptable here."

**Red flags:**
- Chasing trends ("everyone's using X")
- Over-engineering: complex framework for simple problem
- Under-engineering: wrong tool for the job (frontend framework for backend service)
- Heavy coupling to a single library (hard to replace if it fails)

**Growth area questions:**
- "Why not [other popular choice]?"
- "What would happen if this library became unmaintained?"
- "Is the team comfortable supporting this choice long-term?"
- "Could you have solved this with something simpler?"

## 5. Operational Thinking

**What it is:** Has the engineer thought beyond "it works on my machine"? Failure modes, observability, deployment, runbooks?

**Questions to ask:**
- What breaks, and what's the recovery path?
- Can you observe the system in production (logs, metrics, traces)?
- How does this get deployed and rolled back?
- What on-call burden does this create?

**What good looks like:**
- "If the cache goes down, we degrade to direct database queries. Slower but still functional."
- "Every critical path is instrumented with traces. If latency jumps, we can identify which service."
- "We can deploy this independently without coordinating with 5 other teams."

**Red flags:**
- "We'll figure out observability later"
- "This service has no circuit breaker for downstream dependencies"
- "Rollback requires manual intervention and coordination"
- "On-call will need to understand 3 systems just to debug this one change"

**Growth area questions:**
- "What's your observability story here?"
- "How would you debug a production issue?"
- "What's the worst-case failure and how do you recover?"
- "What operational complexity does this add?"

## 6. Communication Clarity

**What it is:** Can the engineer articulate the design, its constraints, and its trade-offs to peers and stakeholders?

**Questions to ask:**
- Is the design understandable?
- Can the engineer explain the "why," not just the "what"?
- Are diagrams clear (if present)?
- Could another engineer build on this work?

**What good looks like:**
- Design doc that starts with constraints, then explains the approach
- Architecture diagrams with annotations explaining the choices
- Clear section on "what this solves" and "what this doesn't solve"
- Openness to questions and critique

**Red flags:**
- Design doc that reads like implementation steps ("first we add a table, then...")
- No high-level overview before diving into details
- Defensive tone: "we had to do this" instead of "we chose this because"
- Missing context on decisions

**Growth area questions:**
- "Can you explain this in a sentence?"
- "If I had to hand this off to someone, what would they need to know?"
- "What's the core insight behind this design?"

---

## Verdict Guide

| Verdict | Meaning |
|---|---|
| **STRONG YES** | Design is sound, well-reasoned, trade-offs explicit. Ready to build. |
| **YES** | Design is solid with minor questions. Proceed with slight caution. |
| **NEEDS WORK** | Design has merit but missing pieces. Revisit one or two areas. |
| **RETHINK** | Fundamental issue with the approach. Major rework needed before building. |

---

## Example Evaluation

**Design:** New microservice for user notifications

**Verdict:** YES (with questions)

**Strengths:**
- Problem well-scoped: "send real-time notifications to mobile clients"
- Clear scalability reasoning: "100 concurrent connections per server; expect 50K DAU; 5 servers sufficient"
- Technology choice justified: "gRPC for internal APIs, WebSocket for client, Redis for delivery state"

**Growth Areas:**
- Operational thinking: design doesn't address what happens if Redis fails. Add a circuit breaker or fallback.
- Scalability reasoning: how will you handle 10x growth? At what point does the bottleneck shift?

**Risks:**
- If message ordering becomes critical, Redis alone won't guarantee it
- WebSocket connections will spike memory usage during deploys; need careful rollout strategy

**Questions:**
- How do you ensure notification delivery if the user's connection drops mid-delivery?
- What's the monitoring/alerting strategy for this service?
- Can clients subscribe to multiple channels, and is there a max subscriptions limit?

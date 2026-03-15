# Scalability Design

## Horizontal scaling

- **Stateless API:** The NestJS backend holds no session state in memory. JWT is validated per request; refresh tokens are stored in the DB. You can run multiple backend instances behind a load balancer.
- **WebSockets:** Socket.IO is used for real-time events. To scale WebSockets across instances, Redis pub/sub is used: when a match (or other event) occurs, the API publishes to a Redis channel; all instances subscribe and emit to their connected clients in the relevant room. The current implementation publishes from the instance that creates the match and subscribes in each instance’s gateway to broadcast to local sockets. For full multi-instance Socket.IO scaling, consider the [Socket.IO Redis adapter](https://socket.io/docs/v4/redis-adapter/) so that `server.to(room).emit()` is propagated across nodes via Redis.
- **Database:** Use connection pooling (Prisma’s default pool). For read-heavy workloads, add PostgreSQL read replicas and route read-only queries (e.g. deck, match history) to replicas via a separate Prisma client or middleware.
- **Caching:** Redis is used for pub/sub; it can also cache hot data (e.g. restaurant deck for a user, group progress). Add cache-aside in services where needed; invalidate on writes.
- **Optional message queue:** For heavy or asynchronous tasks (e.g. sending emails, computing recommendations), integrate a queue (Kafka, SQS, Bull with Redis). The match engine itself is synchronous and fast (indexed queries + single insert + publish).

## Match engine

- **Logic:** A group match is created when the number of “right” swipes on a restaurant by group members reaches the group’s threshold (default 100% = all members).
- **Optimization:** Indexes on `(userId, restaurantId)` for swipes and `(groupId, restaurantId)` for group_matches; aggregation is a single count per (groupId, restaurantId) after each new right swipe. No N+1; optional Redis cache for “likes per group per restaurant” if needed for very large groups.
- **Idempotency:** Before inserting a `group_match`, the code checks that the match doesn’t already exist, so duplicate events or retries don’t create duplicates.

## Summary

| Concern            | Approach                                      |
|--------------------|-----------------------------------------------|
| Stateless API      | JWT + DB-backed refresh tokens                |
| Multiple instances | Load balancer + shared Redis + Redis pub/sub |
| WebSocket scaling  | Redis pub/sub (extend with Socket.IO Redis adapter) |
| DB read scaling    | Read replicas + separate read client          |
| Caching            | Redis cache-aside for hot reads              |
| Async jobs         | Optional Kafka/SQS/Bull for email, analytics  |

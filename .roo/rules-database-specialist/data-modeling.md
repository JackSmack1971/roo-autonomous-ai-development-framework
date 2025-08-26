# Database Excellence & Data Modeling

## Data Modeling Standards

### Normalization Requirements
- [ ] **3NF Minimum**: Eliminate transitive dependencies and redundancy
- [ ] **Performance Exceptions**: Denormalization only for proven performance needs
- [ ] **Referential Integrity**: Foreign key constraints for data consistency
- [ ] **Index Strategy**: Optimal indexes for query patterns without over-indexing
- [ ] **Data Types**: Appropriate data types for storage efficiency and validation

### Query Performance Optimization
- [ ] **Index Coverage**: All frequently queried columns have appropriate indexes
- [ ] **Query Complexity**: Avoid N+1 patterns, use JOINs instead of multiple queries
- [ ] **Result Set Size**: Implement pagination for large result sets (>100 rows)
- [ ] **Connection Management**: Efficient connection pooling and lifecycle management
- [ ] **Transaction Scope**: Minimize transaction duration and scope

## Performance Issue Detection & Resolution

### Automatic Performance Analysis
**Immediately optimize when detecting:**

**N+1 Query Patterns:**
```sql
-- BAD: N+1 Query Pattern
for user in users:
    orders = query("SELECT * FROM orders WHERE user_id = ?", user.id)

-- GOOD: Single Query with JOIN
SELECT u.*, o.* FROM users u 
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = true
```

**Missing Index Detection:**
- Queries taking >50ms on tables with >1000 rows
- WHERE clauses on non-indexed columns
- ORDER BY on non-indexed columns
- JOIN conditions without proper indexes

### Database Testing Integration
```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-tdd-engineer",
    "objective": "Database integration and performance test suite creation",
    "context": {
      "database_operations": "[CRUD operations requiring testing]",
      "performance_requirements": "[query response time and throughput targets]",
      "data_integrity_tests": "[referential integrity and constraint validation]",
      "concurrent_access_scenarios": "[multi-user database interaction patterns]"
    },
    "priority": "high",
    "acceptance_criteria": [
      "database_operations_comprehensively_tested",
      "performance_benchmarks_validate_optimization",
      "data_integrity_constraints_verified",
      "concurrent_access_patterns_validated"
    ]
  }
}
```

### Migration Strategy Planning
```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-platform-engineer",
    "objective": "Database migration and deployment strategy",
    "context": {
      "schema_changes": "[database structure modifications required]",
      "data_migration_needs": "[existing data transformation requirements]",
      "rollback_strategy": "[migration rollback and recovery procedures]",
      "zero_downtime_requirements": "[availability during migration process]"
    },
    "priority": "high"
  }
}
```

# 图数据库 vs SQLite：技术对比与选型指南

> 本文档深入对比图数据库与 SQLite 的特性、优缺点，并提供 Android 移动端的实践建议。

## 目录

- [1. 图数据库基础](#1-图数据库基础)
  - [1.1 核心概念](#11-核心概念)
  - [1.2 典型应用场景](#12-典型应用场景)
  - [1.3 主流图数据库](#13-主流图数据库)
- [2. 三元组关系查询](#2-三元组关系查询)
  - [2.1 三元组结构](#21-三元组结构)
  - [2.2 为什么图数据库利于三元组查询](#22-为什么图数据库利于三元组查询)
  - [2.3 查询性能对比](#23-查询性能对比)
- [3. 图数据库 vs SQLite 全面对比](#3-图数据库-vs-sqlite-全面对比)
  - [3.1 部署和运维](#31-部署和运维)
  - [3.2 生态和工具成熟度](#32-生态和工具成熟度)
  - [3.3 性能特点](#33-性能特点)
  - [3.4 数据一致性和事务](#34-数据一致性和事务)
  - [3.5 存储效率](#35-存储效率)
- [4. Android 移动端实践](#4-android-移动端实践)
  - [4.1 SQLite 优化方案](#41-sqlite-优化方案)
  - [4.2 混合架构方案](#42-混合架构方案)
- [5. 决策指南](#5-决策指南)
  - [5.1 决策树](#51-决策树)
  - [5.2 选型建议](#52-选型建议)
- [6. 总结](#6-总结)

---

## 1. 图数据库基础

### 1.1 核心概念

图数据库（Graph Database）是一种专门用于存储和查询**关系密集型数据**的数据库，它使用图论中的数据结构来表示和存储数据。

#### 核心组成元素

| 元素 | 说明 | 示例 |
|------|------|------|
| **节点（Node/Vertex）** | 代表实体 | 人、公司、产品、地点 |
| **边（Edge/Relationship）** | 代表实体间的关系 | "认识"、"购买"、"工作于" |
| **属性（Property）** | 节点和边的附加信息 | 人的年龄、关系建立时间 |

#### 图结构示例

```
节点: [张三] [李四] [阿里巴巴] [北京]
关系:
  [张三] --认识--> [李四]
  [张三] --工作于--> [阿里巴巴]
  [李四] --居住在--> [北京]
  [阿里巴巴] --位于--> [杭州]
```

### 1.2 典型应用场景

1. **社交网络**
   - 好友关系管理
   - 社交推荐（共同好友、可能认识的人）
   - 影响力分析

2. **知识图谱**
   - 实体关系网络
   - 语义搜索
   - 智能问答系统

3. **欺诈检测**
   - 复杂关联分析
   - 异常模式识别
   - 风险传播路径追踪

4. **推荐系统**
   - 协同过滤
   - 基于关系的推荐
   - 路径推理

5. **网络拓扑**
   - IT 基础设施管理
   - 依赖关系分析
   - 影响范围评估

### 1.3 主流图数据库

| 数据库 | 类型 | 特点 | 适用场景 |
|--------|------|------|----------|
| **Neo4j** | 原生图数据库 | 成熟、生态好、Cypher 查询语言 | 企业级应用 |
| **JanusGraph** | 分布式图数据库 | 可扩展、支持多种存储后端 | 大规模图数据 |
| **ArangoDB** | 多模型数据库 | 支持文档、图、K-V | 混合场景 |
| **Amazon Neptune** | 云托管图数据库 | AWS 集成、支持 Gremlin/SPARQL | 云原生应用 |
| **TigerGraph** | 分析型图数据库 | 高性能、实时分析 | 大数据分析 |

---

## 2. 三元组关系查询

### 2.1 三元组结构

**三元组（Triple）** 是图数据库中最基本的数据表示单元，由三部分组成：

```
(主语, 谓语, 宾语)
或
(Subject, Predicate, Object)
```

#### 具体示例

```
(张三, 工作于, 阿里巴巴)
(张三, 认识, 李四)
(李四, 居住在, 北京)
(阿里巴巴, 位于, 杭州)
(张三, 年龄, 30)
```

#### 三元组到图的映射

- **主语** → 起始节点
- **谓语** → 边/关系类型
- **宾语** → 目标节点或属性值

### 2.2 为什么图数据库利于三元组查询

#### 1. 数据模型天然匹配

图数据库的底层存储结构就是基于节点-关系-节点的模式，与三元组完美对应：

```
传统关系数据库:
Table: Person        Table: Works_At      Table: Company
+---------+          +----------+         +---------+
| id|name |          |person|co.|         | id|name |
+---------+          +----------+         +---------+

图数据库:
(Person:张三) -[:工作于]-> (Company:阿里巴巴)
直接对应三元组：(张三, 工作于, 阿里巴巴)
```

#### 2. 查询效率高

**关系遍历的时间复杂度**：
- SQLite JOIN: O(n×m)，随关系深度指数增长
- 图数据库: O(1) 查找邻居节点（邻接表索引）

#### 3. 支持复杂路径查询

图数据库原生支持：
- 最短路径
- 所有路径枚举
- 模式匹配
- 子图查询

### 2.3 查询性能对比

#### 场景1: 查找"朋友的朋友"

**SQLite 实现**（需要 2 次 JOIN）：

```sql
SELECT DISTINCT p3.name
FROM person p1
JOIN friendship f1 ON p1.id = f1.person1_id
JOIN friendship f2 ON f1.person2_id = f2.person1_id
JOIN person p3 ON f2.person2_id = p3.id
WHERE p1.name = '张三';
```

**图数据库实现**（Neo4j Cypher）：

```cypher
MATCH (张三:Person {name: '张三'})-[:认识*2]-(friend)
RETURN DISTINCT friend.name
```

**性能对比**：

| 好友数量 | 关系层数 | SQLite 耗时 | 图数据库耗时 | 性能比 |
|----------|----------|-------------|--------------|--------|
| 100 | 2层 | 10ms | 5ms | 2x |
| 100 | 3层 | 150ms | 8ms | 18x |
| 100 | 4层 | 2000ms | 12ms | 166x |
| 1000 | 3层 | 超时 | 50ms | 极大 |

#### 场景2: 最短路径查询

**图数据库**：

```cypher
MATCH path = shortestPath(
  (张三:Person {name: '张三'})-[*]-(李四:Person {name: '李四'})
)
RETURN path, length(path)
```

**SQLite**：需要实现 Dijkstra 或 BFS 算法，性能随图规模急剧下降。

---

## 3. 图数据库 vs SQLite 全面对比

### 3.1 部署和运维

#### SQLite

**优势**：
- ✅ 单文件数据库，零配置
- ✅ Android 原生支持，无需额外依赖
- ✅ 应用内嵌，随应用安装
- ✅ 备份简单（复制文件即可）
- ✅ 无需独立进程，内存占用小

**劣势**：
- ❌ 不支持分布式
- ❌ 并发写入能力弱
- ❌ 不适合服务端高并发场景

#### 图数据库

**优势**：
- ✅ 分布式扩展能力强（如 JanusGraph）
- ✅ 高并发读写支持
- ✅ 集群高可用

**劣势**：
- ❌ 需要独立服务进程（Neo4j、JanusGraph）
- ❌ 配置复杂，内存需求大（通常 4GB+）
- ❌ 移动端支持极其有限
- ❌ 运维成本高
- ❌ Android 无成熟方案

### 3.2 生态和工具成熟度

| 维度 | SQLite | 图数据库 |
|------|--------|----------|
| **移动端支持** | ⭐⭐⭐⭐⭐ Room、原生 API | ⭐ 基本没有 |
| **开发者熟悉度** | ⭐⭐⭐⭐⭐ SQL 通用技能 | ⭐⭐ 需学习 Cypher/Gremlin |
| **调试工具** | ⭐⭐⭐⭐⭐ Android Studio 内置 | ⭐⭐⭐ 需专用工具 |
| **ORM 框架** | ⭐⭐⭐⭐⭐ Room、SQLDelight | ⭐⭐ 有限 |
| **迁移工具** | ⭐⭐⭐⭐⭐ 成熟的 Migration | ⭐⭐ 工具不完善 |
| **文档资源** | ⭐⭐⭐⭐⭐ 海量教程 | ⭐⭐⭐ 相对较少 |
| **社区活跃度** | ⭐⭐⭐⭐⭐ 极其活跃 | ⭐⭐⭐ 中等 |

### 3.3 性能特点

#### SQLite 优势场景

✅ **简单 CRUD 操作**
```sql
-- 插入、更新、删除单条记录
INSERT INTO users (name, age) VALUES ('张三', 30);
UPDATE users SET age = 31 WHERE id = 123;
DELETE FROM users WHERE id = 123;
```

✅ **精确索引查询**
```sql
-- B-Tree 索引，毫秒级响应
SELECT * FROM users WHERE email = 'zhangsan@example.com';
```

✅ **聚合统计**
```sql
-- 高效的聚合函数
SELECT category, COUNT(*), AVG(price), SUM(quantity)
FROM products
GROUP BY category;
```

✅ **简单关联查询（1-2 层）**
```sql
-- 单层 JOIN 性能良好
SELECT o.*, u.name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.id = 123;
```

#### 图数据库优势场景

✅ **多层关系遍历（3层+）**
```cypher
-- 查找"朋友的朋友的朋友"
MATCH (me:Person)-[:FRIEND*3]-(friend)
WHERE me.id = 123
RETURN DISTINCT friend.name
```

✅ **复杂路径查询**
```cypher
-- 最短路径
MATCH path = shortestPath((a:Person)-[*]-(b:Person))
WHERE a.id = 123 AND b.id = 456
RETURN path

-- 所有路径
MATCH path = (a:Person)-[*..5]-(b:Person)
WHERE a.id = 123 AND b.id = 456
RETURN path
```

✅ **模式匹配**
```cypher
-- 找出共同好友最多的推荐对象
MATCH (me:Person)-[:FRIEND]-(mutual)-[:FRIEND]-(recommend)
WHERE me.id = 123 AND NOT (me)-[:FRIEND]-(recommend)
RETURN recommend.name, COUNT(mutual) AS common_friends
ORDER BY common_friends DESC
LIMIT 10
```

✅ **动态关系网络**
```cypher
-- 查找影响传播路径
MATCH path = (source:User)-[:INFLUENCED*]->(target:User)
WHERE source.id = 123
RETURN path, length(path)
```

#### 性能测试数据（示例）

| 查询类型 | 数据规模 | SQLite | 图数据库 | 胜者 |
|----------|----------|--------|----------|------|
| 单条查询 | 100万条 | 1ms | 2ms | SQLite |
| 1层JOIN | 100万条 | 10ms | 15ms | SQLite |
| 2层JOIN | 100万条 | 80ms | 20ms | 图数据库 |
| 3层JOIN | 100万条 | 1500ms | 25ms | 图数据库 |
| 最短路径 | 10万节点 | 超时 | 50ms | 图数据库 |
| 聚合统计 | 100万条 | 50ms | 200ms | SQLite |

### 3.4 数据一致性和事务

#### SQLite

**ACID 完整支持**：
- ✅ **原子性**：事务要么全部完成，要么全部回滚
- ✅ **一致性**：外键约束、CHECK 约束
- ✅ **隔离性**：支持多种隔离级别
- ✅ **持久性**：WAL 模式保证数据安全

```kotlin
// Room 事务示例
@Transaction
suspend fun transferMoney(fromId: Long, toId: Long, amount: Double) {
    accountDao.decreaseBalance(fromId, amount)
    accountDao.increaseBalance(toId, amount)
    // 任何失败都会回滚
}
```

**约束机制**：
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    age INTEGER CHECK(age >= 0 AND age <= 150),
    company_id INTEGER,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

#### 图数据库

**事务支持**：
- ⚠️ 单机图数据库（Neo4j）ACID 支持较好
- ⚠️ 分布式图数据库一致性较弱（最终一致性）
- ⚠️ 跨分区事务性能差

**约束有限**：
```cypher
-- Neo4j 约束示例（功能有限）
CREATE CONSTRAINT person_email IF NOT EXISTS
FOR (p:Person) REQUIRE p.email IS UNIQUE;

// 但缺少复杂的外键、CHECK 约束
```

### 3.5 存储效率

#### SQLite

**优势**：
- ✅ 高度优化的 B-Tree 存储
- ✅ 磁盘占用小（通常比图数据库少 50%-70%）
- ✅ 适合移动设备
- ✅ 压缩选项

**示例数据**：
- 100万用户 + 1000万关系 ≈ 500MB

#### 图数据库

**特点**：
- ⚠️ 为关系存储优化，会有额外开销
- ⚠️ 索引多（节点索引、关系索引），磁盘占用大
- ⚠️ 内存需求高（缓存邻接列表）

**示例数据**：
- 100万用户 + 1000万关系 ≈ 1.5GB - 2GB

---

## 4. Android 移动端实践

### 4.1 SQLite 优化方案

即使关系查询需求不是特别复杂，也可以通过以下方式优化 SQLite。

#### 方案1: 递归 CTE（Common Table Expression）

SQLite 3.8.3+ 支持递归查询，适合固定深度的关系遍历。

```sql
-- 查找朋友网络（深度≤3）
WITH RECURSIVE friend_network(person_id, friend_id, depth, path) AS (
  -- 初始节点（我自己）
  SELECT id, id, 0, CAST(id AS TEXT)
  FROM person
  WHERE id = 123
  
  UNION ALL
  
  -- 递归查找朋友
  SELECT 
    fn.person_id,
    f.person2_id,
    fn.depth + 1,
    fn.path || '->' || f.person2_id
  FROM friend_network fn
  JOIN friendship f ON fn.friend_id = f.person1_id
  WHERE fn.depth < 3  -- 限制深度
    AND INSTR(fn.path, CAST(f.person2_id AS TEXT)) = 0  -- 避免环路
)
SELECT DISTINCT p.* 
FROM friend_network fn
JOIN person p ON fn.friend_id = p.id
WHERE fn.depth > 0;  -- 排除自己
```

**优缺点**：
- ✅ 无需修改表结构
- ✅ 适合深度固定的场景
- ❌ 深度 > 4 时性能急剧下降
- ❌ 不支持动态路径算法

#### 方案2: 预计算路径缓存表

对于常用的关系查询，预先计算并缓存结果。

```kotlin
// 路径缓存表
@Entity(
    tableName = "friend_paths",
    indices = [
        Index("from_user_id", "depth"),
        Index("to_user_id")
    ]
)
data class FriendPath(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "from_user_id") val fromUserId: Long,
    @ColumnInfo(name = "to_user_id") val toUserId: Long,
    val depth: Int,  // 关系层数
    val pathJson: String  // JSON 存储完整路径
)

// 定期后台任务更新路径缓存
class PathCacheWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        // BFS 计算所有用户的 1-3 层关系
        val users = database.userDao().getAllUsers()
        users.forEach { user ->
            calculateAndCachePaths(user.id, maxDepth = 3)
        }
        return Result.success()
    }
    
    private suspend fun calculateAndCachePaths(userId: Long, maxDepth: Int) {
        val queue = ArrayDeque<Pair<Long, Int>>()
        val visited = mutableSetOf<Long>()
        val paths = mutableListOf<FriendPath>()
        
        queue.add(userId to 0)
        visited.add(userId)
        
        while (queue.isNotEmpty()) {
            val (currentId, depth) = queue.removeFirst()
            if (depth >= maxDepth) continue
            
            val friends = database.friendshipDao().getFriends(currentId)
            friends.forEach { friendId ->
                if (visited.add(friendId)) {
                    paths.add(FriendPath(
                        fromUserId = userId,
                        toUserId = friendId,
                        depth = depth + 1,
                        pathJson = buildPathJson(userId, friendId)
                    ))
                    queue.add(friendId to depth + 1)
                }
            }
        }
        
        database.friendPathDao().insertPaths(paths)
    }
}

// 查询时直接读取缓存
suspend fun findFriendsOfFriends(userId: Long): List<User> {
    return database.friendPathDao()
        .getPathsByUserAndDepth(userId, depth = 2)
        .map { path -> database.userDao().getUserById(path.toUserId) }
}
```

**优缺点**：
- ✅ 查询极快（直接读缓存）
- ✅ 支持复杂路径查询
- ❌ 需要额外存储空间
- ❌ 数据更新时需重新计算
- ❌ 不适合实时性要求高的场景

#### 方案3: Room + 内存图结构

持久化用 SQLite，关系查询在内存中用图算法。

```kotlin
// 图结构管理器
class InMemoryGraphManager(private val database: AppDatabase) {
    
    // 邻接表：用户ID -> 好友ID集合
    private val adjacencyList = ConcurrentHashMap<Long, MutableSet<Long>>()
    
    // 启动时加载图到内存
    suspend fun initialize() {
        withContext(Dispatchers.IO) {
            adjacencyList.clear()
            
            // 加载所有好友关系
            database.friendshipDao().getAllFriendships().forEach { friendship ->
                adjacencyList.getOrPut(friendship.userId1) { ConcurrentHashMap.newKeySet() }
                    .add(friendship.userId2)
                adjacencyList.getOrPut(friendship.userId2) { ConcurrentHashMap.newKeySet() }
                    .add(friendship.userId1)  // 双向关系
            }
            
            Log.d("Graph", "Loaded ${adjacencyList.size} nodes")
        }
    }
    
    // BFS 查找多层好友
    fun findFriendsAtDepth(userId: Long, targetDepth: Int): Set<Long> {
        val result = mutableSetOf<Long>()
        val visited = mutableSetOf(userId)
        val queue = ArrayDeque<Pair<Long, Int>>()
        
        queue.add(userId to 0)
        
        while (queue.isNotEmpty()) {
            val (currentId, depth) = queue.removeFirst()
            
            if (depth == targetDepth) {
                result.add(currentId)
                continue
            }
            
            if (depth >= targetDepth) continue
            
            adjacencyList[currentId]?.forEach { friendId ->
                if (visited.add(friendId)) {
                    queue.add(friendId to depth + 1)
                }
            }
        }
        
        return result - userId  // 排除自己
    }
    
    // Dijkstra 最短路径
    fun findShortestPath(fromId: Long, toId: Long): List<Long>? {
        val distances = mutableMapOf<Long, Int>().withDefault { Int.MAX_VALUE }
        val previous = mutableMapOf<Long, Long>()
        val unvisited = PriorityQueue<Pair<Long, Int>>(compareBy { it.second })
        
        distances[fromId] = 0
        unvisited.add(fromId to 0)
        
        while (unvisited.isNotEmpty()) {
            val (currentId, currentDist) = unvisited.poll()
            
            if (currentId == toId) {
                // 回溯路径
                return buildPath(previous, fromId, toId)
            }
            
            if (currentDist > distances.getValue(currentId)) continue
            
            adjacencyList[currentId]?.forEach { neighborId ->
                val newDist = currentDist + 1
                if (newDist < distances.getValue(neighborId)) {
                    distances[neighborId] = newDist
                    previous[neighborId] = currentId
                    unvisited.add(neighborId to newDist)
                }
            }
        }
        
        return null  // 无路径
    }
    
    private fun buildPath(previous: Map<Long, Long>, from: Long, to: Long): List<Long> {
        val path = mutableListOf<Long>()
        var current = to
        
        while (current != from) {
            path.add(0, current)
            current = previous[current] ?: return emptyList()
        }
        path.add(0, from)
        
        return path
    }
    
    // 添加好友时更新图
    suspend fun addFriendship(userId1: Long, userId2: Long) {
        withContext(Dispatchers.IO) {
            // 1. 更新数据库
            database.friendshipDao().insert(Friendship(userId1, userId2))
            
            // 2. 更新内存图
            adjacencyList.getOrPut(userId1) { ConcurrentHashMap.newKeySet() }
                .add(userId2)
            adjacencyList.getOrPut(userId2) { ConcurrentHashMap.newKeySet() }
                .add(userId1)
        }
    }
}

// 在 Application 中初始化
class MyApplication : Application() {
    lateinit var graphManager: InMemoryGraphManager
    
    override fun onCreate() {
        super.onCreate()
        
        val database = Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java,
            "app-database"
        ).build()
        
        graphManager = InMemoryGraphManager(database)
        
        // 异步加载图
        lifecycleScope.launch {
            graphManager.initialize()
        }
    }
}
```

**使用示例**：

```kotlin
class SocialViewModel(
    private val graphManager: InMemoryGraphManager,
    private val userDao: UserDao
) : ViewModel() {
    
    // 查找二度好友（朋友的朋友）
    fun findFriendsOfFriends(userId: Long): LiveData<List<User>> {
        return liveData {
            val friendIds = graphManager.findFriendsAtDepth(userId, targetDepth = 2)
            val users = userDao.getUsersByIds(friendIds.toList())
            emit(users)
        }
    }
    
    // 计算社交距离
    fun calculateSocialDistance(userId1: Long, userId2: Long): LiveData<Int?> {
        return liveData {
            val path = graphManager.findShortestPath(userId1, userId2)
            emit(path?.size?.minus(1))  // 路径长度 - 1 = 距离
        }
    }
}
```

**优缺点**：
- ✅ 查询性能极高（纯内存操作）
- ✅ 支持任意图算法
- ✅ 灵活性强
- ❌ 内存占用大（10万用户约 50MB）
- ❌ 冷启动需加载时间
- ❌ 需同步维护内存和数据库状态

### 4.2 混合架构方案

#### 方案1: SQLite + Redis（适合服务端）

```
客户端 <-> 服务端:
               ├─ SQLite: 持久化存储
               ├─ Redis: 图关系缓存
               └─ 业务逻辑层: 协调两者
```

#### 方案2: 本地 SQLite + 云端图数据库

```kotlin
// 本地 SQLite 缓存
class HybridRepository(
    private val localDb: AppDatabase,
    private val graphApi: GraphApiService
) {
    
    suspend fun findRecommendedFriends(userId: Long): List<User> {
        // 1. 先查本地缓存
        val cached = localDb.recommendationDao()
            .getRecommendations(userId, System.currentTimeMillis() - CACHE_TTL)
        
        if (cached.isNotEmpty()) {
            return cached
        }
        
        // 2. 缓存过期，查询云端图数据库
        val recommendations = graphApi.getRecommendedFriends(userId)
        
        // 3. 更新本地缓存
        localDb.recommendationDao().insertRecommendations(
            recommendations.map { 
                RecommendationCache(
                    userId = userId,
                    recommendedUserId = it.id,
                    score = it.score,
                    timestamp = System.currentTimeMillis()
                )
            }
        )
        
        return recommendations
    }
    
    companion object {
        private const val CACHE_TTL = 24 * 60 * 60 * 1000L  // 24小时
    }
}
```

---

## 5. 决策指南

### 5.1 决策树

```
┌─────────────────────────────────┐
│   是否在 Android 移动端？        │
└─────────┬───────────────────────┘
          │
    ┌─────┴─────┐
    │           │
   是          否
    │           │
    │           └─> 服务端场景
    │               │
    │               ├─ 关系密集、多层遍历 → 图数据库
    │               ├─ 混合场景 → SQLite/PostgreSQL + 辅助图数据库
    │               └─ 简单关系 → 传统关系数据库
    │
    └─> ┌──────────────────────────────┐
        │ 优先使用 SQLite + Room        │
        └────────┬─────────────────────┘
                 │
                 └─> 关系查询深度 > 3 层？
                     │
                ┌────┴────┐
                │         │
               是        否
                │         │
                │         └─> 直接用 SQLite
                │
                └─> 数据规模？
                    │
                    ├─ < 10万节点 → 混合方案（SQLite + 内存图）
                    ├─ > 10万节点 → 考虑云端图数据库 + 本地缓存
                    └─ 实时性要求低 → 预计算路径缓存
```

### 5.2 选型建议

#### Android 移动端场景

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| **简单应用** | SQLite + Room | 零学习成本，性能足够 |
| **社交应用** | SQLite + 内存图 | 平衡性能和复杂度 |
| **轻量社交** | SQLite + 递归 CTE | 无需额外代码，适合固定深度 |
| **重度社交** | 本地 SQLite + 云端图数据库 | 复杂计算云端处理 |
| **知识管理** | SQLite + 预计算缓存 | 离线优先，实时性要求不高 |
| **推荐系统** | 云端图数据库 | 复杂算法需服务端算力 |

#### 服务端场景

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| **传统 CRUD** | PostgreSQL/MySQL | 成熟、稳定、生态好 |
| **社交网络** | Neo4j | 专为社交关系设计 |
| **知识图谱** | Neo4j + Elasticsearch | 图查询 + 全文搜索 |
| **大规模图** | JanusGraph | 分布式扩展 |
| **混合场景** | PostgreSQL + Redis | 关系缓存，成本低 |
| **实时推荐** | TigerGraph | 高性能实时分析 |

#### 关键决策因素

**优先选择 SQLite 如果**：
- ✅ 90% 的移动应用场景
- ✅ 关系深度 ≤ 2 层
- ✅ 数据量 < 100万条
- ✅ 离线优先
- ✅ 团队熟悉 SQL
- ✅ 快速迭代需求

**考虑图数据库如果**：
- 🤔 关系深度 > 3 层
- 🤔 复杂路径查询是核心功能
- 🤔 数据规模 > 百万节点
- 🤔 实时推荐、欺诈检测等场景
- 🤔 有专门的运维团队
- 🤔 预算充足

**混合方案如果**：
- ⚡ 既有简单 CRUD 又有复杂关系查询
- ⚡ 需要渐进式迁移
- ⚡ 成本敏感
- ⚡ 需要利用现有技术栈

---

## 6. 总结

### 图数据库的核心优势

1. **天然支持三元组关系查询**
   - 数据模型直接映射（主语-谓语-宾语 → 节点-边-节点）
   - 关系是一等公民，而非附属
   - 遍历性能恒定（O(1) 查找邻居）

2. **复杂关系查询性能极高**
   - 多层关系遍历（3层以上）性能优势明显
   - 最短路径、模式匹配等图算法原生支持
   - 随关系深度增加，性能优势指数级增长

3. **声明式查询语言**
   - Cypher/Gremlin 直观表达图查询
   - 无需复杂 JOIN 构造
   - 代码可读性强

### 图数据库的主要缺点

1. **移动端不适用**
   - Android 无成熟方案
   - 需要独立服务进程
   - 资源消耗大

2. **学习成本高**
   - 新查询语言（Cypher/Gremlin）
   - 新思维模式（图思维 vs 表思维）
   - 团队需要培训

3. **运维复杂**
   - 配置复杂，内存需求大
   - 需要专业运维
   - 成本高

4. **生态不成熟**
   - 工具链不如 SQL 丰富
   - 第三方库少
   - 文档资源有限

5. **事务能力较弱**
   - 分布式场景一致性保证难
   - 约束机制不完善
   - ACID 支持有限

6. **可能过度设计**
   - 90% 场景用不到深层关系查询
   - 简单问题复杂化
   - 引入不必要的复杂度

### 最佳实践建议

#### For Android 开发者

1. **默认选择 SQLite + Room**
   - 覆盖绝大多数场景
   - 零额外成本
   - 团队熟悉

2. **关系查询优化路径**
   ```
   Level 1: 递归 CTE（深度 ≤ 3）
         ↓
   Level 2: 内存图结构（深度 > 3，数据量 < 10万）
         ↓
   Level 3: 预计算缓存（实时性要求不高）
         ↓
   Level 4: 云端图数据库（重度社交场景）
   ```

3. **渐进式演进**
   - 从 SQLite 开始
   - 遇到性能瓶颈再优化
   - 避免过早优化

#### For 架构设计

1. **评估真实需求**
   - 关系查询占比多少？
   - 最大查询深度？
   - QPS 要求？

2. **成本收益分析**
   - 图数据库带来的性能提升
   - 引入的复杂度成本
   - 团队学习成本

3. **混合架构**
   - 用对的工具做对的事
   - SQLite 处理 CRUD
   - 图数据库处理复杂关系
   - 不要 All-in

### 结语

**图数据库不是银弹**。它在特定场景（复杂关系网络、多层遍历、路径查询）下表现优异，但同时也带来了更高的复杂度、学习成本和运维成本。

对于 **Android 移动端开发**，SQLite + Room 仍然是首选方案。只有在明确遇到关系查询性能瓶颈，且优化 SQLite 无法解决时，才需要考虑引入图数据库（通常是云端图数据库 + 本地缓存的混合架构）。

**记住**：
- 简单问题用简单方案
- 复杂问题才用复杂方案
- 渐进式演进优于一步到位
- 用对的工具做对的事

---

## 参考资源

### 图数据库

- [Neo4j 官方文档](https://neo4j.com/docs/)
- [Cypher 查询语言](https://neo4j.com/developer/cypher/)
- [Graph Databases (O'Reilly 书籍)](https://neo4j.com/graph-databases-book/)

### SQLite 优化

- [SQLite 官方文档](https://www.sqlite.org/docs.html)
- [Android Room 指南](https://developer.android.com/training/data-storage/room)
- [SQLite CTE 文档](https://www.sqlite.org/lang_with.html)

### 算法

- [图算法导论](https://en.wikipedia.org/wiki/Graph_theory)
- [BFS/DFS 实现](https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/)

---

**文档版本**: 1.0  
**最后更新**: 2026-01-28  
**作者**: Jacky  
**适用项目**: Verity Android App

# KD-001：贪食蛇游戏引擎

**关联 Story**：ST-002
**前置 KD**：无

## 核心方案

`SnakeGameEngine` 为纯 TypeScript 类，不依赖 React。每次 `tick()` 根据当前方向移动蛇头，检测碰撞，处理吃食物逻辑，返回新 `GameState`。

## 关键类图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
classDiagram
    direction TB

    class SnakeGameEngine {
        -state: GameState
        +constructor(gridSize: number)
        +getState() GameState
        +reset() void
        +setDirection(dir: Direction) void
        +togglePause() void
        +tick() TickResult
        -moveHead() Position
        -checkCollision(pos: Position) boolean
        -spawnFood() Position
        -isOpposite(a: Direction, b: Direction) boolean
    }

    class Direction {
        <<enumeration>>
        UP
        DOWN
        LEFT
        RIGHT
    }

    class GameStatus {
        <<enumeration>>
        PLAYING
        PAUSED
        GAME_OVER
    }

    SnakeGameEngine --> Direction
    SnakeGameEngine --> GameStatus
```

## 核心调用链时序图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'actorBkg': '#E3F2FD', 'actorBorder': '#1976D2', 'actorTextColor': '#1565C0', 'signalColor': '#1976D2', 'signalTextColor': '#212121', 'noteBkgColor': '#FFF8E1', 'noteBorderColor': '#FFC107'}}}%%
sequenceDiagram
    autonumber

    actor User as 用户
    participant Hook as useSnakeGame
    participant Engine as SnakeGameEngine
    participant UI as GameBoard

    User->>Hook: 方向键输入
    Hook->>Engine: setDirection(dir)
    Engine-->>Hook: 更新 nextDirection

    loop 每 100ms tick
        Hook->>Engine: tick()
        alt 状态为 PAUSED
            Engine-->>Hook: state 不变
        else 状态为 PLAYING
            Engine->>Engine: moveHead + 碰撞检测
            alt 撞墙或撞自身
                Engine-->>Hook: status=GAME_OVER
            else 吃到食物
                Engine->>Engine: spawnFood, score++
                Engine-->>Hook: 新 state
            else 正常移动
                Engine-->>Hook: 新 state
            end
        end
        Hook->>UI: 重绘 Canvas
    end

    alt 用户按 Space
        User->>Hook: togglePause
        Hook->>Engine: togglePause()
    end
```

### 协作者与过程说明

1. **触发与入口**：用户通过键盘改变方向或暂停；`useSnakeGame` 注册 `keydown` 监听并调用 Engine。
2. **协作链**：Hook 持有 Engine 实例；interval 驱动 `tick()`；tick 结果通过 React setState 触发 UI 重绘。
3. **数据流**：Engine 内部维护不可变 state 副本；每次 tick 返回新对象。
4. **分支与异常**：
   - 暂停：tick 早返回，不移动
   - 碰撞：status 置 GAME_OVER
   - 禁止反向：`setDirection` 忽略与当前方向相反输入
   - N/A 网络/持久化/权限/并发/空状态（棋盘满时 game over）
5. **结束条件**：GAME_OVER 或用户 reset。

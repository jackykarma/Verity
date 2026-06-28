# KD-001：卡比平台跳跃引擎

**关联 Story**：ST-002
**前置 KD**：无

## 核心方案

`PlatformerGameEngine` 为纯 TypeScript 类，不依赖 React。每次 `update(dt)` 根据输入应用水平加速度、重力、AABB 平台碰撞，检测星星收集、旗杆通关与掉落失败，返回新 `GameState`。

## 关键类图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
classDiagram
    direction TB

    class PlatformerGameEngine {
        -state: GameState
        -input: InputState
        +constructor()
        +getState() GameState
        +reset() void
        +setInput(input: InputState) void
        +togglePause() void
        +update(dt: number) UpdateResult
        -applyHorizontalMovement(dt: number) void
        -applyGravity(dt: number) void
        -resolvePlatformCollisions() void
    }

    class GameStatus {
        <<enumeration>>
        PLAYING
        PAUSED
        GAME_OVER
        WON
    }

    PlatformerGameEngine --> GameStatus
```

## 核心调用链时序图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'actorBkg': '#E3F2FD', 'actorBorder': '#1976D2', 'actorTextColor': '#1565C0', 'signalColor': '#1976D2', 'signalTextColor': '#212121', 'noteBkgColor': '#FFF8E1', 'noteBorderColor': '#FFC107'}}}%%
sequenceDiagram
    autonumber

    actor User as 用户
    participant Hook as usePlatformerGame
    participant Engine as PlatformerGameEngine
    participant UI as GameCanvas

    User->>Hook: 键盘输入（移动/跳跃）
    Hook->>Engine: setInput(input)

    loop 每帧 rAF
        Hook->>Engine: update(dt)
        alt 状态为 PAUSED / WON / GAME_OVER
            Engine-->>Hook: state 不变
        else 状态为 PLAYING
            Engine->>Engine: 物理 + 碰撞
            alt 收集星星
                Engine-->>Hook: event=COLLECT, score++
            else 触碰旗杆
                Engine-->>Hook: status=WON
            else 掉落死亡区
                Engine-->>Hook: status=GAME_OVER
            else 正常
                Engine-->>Hook: 新 state + cameraX
            end
        end
        Hook->>UI: 重绘 Canvas
    end

    alt 用户按 P 或暂停按钮
        User->>Hook: togglePause
        Hook->>Engine: togglePause()
    end
```

### 协作者与过程说明

1. **触发与入口**：用户通过键盘控制移动与跳跃；`usePlatformerGame` 注册 `keydown`/`keyup` 并维护 `InputState`。
2. **协作链**：Hook 持有 Engine 实例；`requestAnimationFrame` 驱动 `update(dt)`；结果通过 React setState 触发 Canvas 重绘。
3. **数据流**：Engine 内部维护 state；每次 update 基于 dt 推进物理；cameraX 由 kirby.x 推导。
4. **分支与异常**：
   - 暂停：update 早返回，不推进物理
   - 通关：status 置 WON
   - 掉落：status 置 GAME_OVER
   - 跳跃：仅 grounded 时响应 jumpPressed
   - N/A 网络/持久化/权限/并发/空状态
5. **结束条件**：WON / GAME_OVER 或用户 reset。

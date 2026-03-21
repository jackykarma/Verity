# 测试文档 - Mermaid 图表示例

本文档用于测试 Mermaid 图表导出功能。

## 用户注册流程

下面是用户注册的完整流程图：

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#E3F2FD',
  'primaryTextColor': '#1565C0',
  'primaryBorderColor': '#1976D2',
  'lineColor': '#546E7A'
}}}%%
flowchart TD
    Start([开始]) --> Input[用户输入信息]
    Input --> Check{信息验证}
    
    Check -->|有效| CreateUser[创建用户账户]
    Check -->|无效| ShowError[显示错误信息]
    
    ShowError --> Input
    CreateUser --> SendEmail[发送验证邮件]
    SendEmail --> WaitVerify[等待邮箱验证]
    
    WaitVerify --> Verified{已验证?}
    Verified -->|是| Success[注册成功]
    Verified -->|否| Timeout{超时?}
    
    Timeout -->|是| Failed[注册失败]
    Timeout -->|否| WaitVerify
    
    Success --> End([结束])
    Failed --> End

    style Start fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
    style End fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
    style Failed fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px
    style Check fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    style Verified fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    style Timeout fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
```

## 系统架构

```mermaid
%%{title: "三层架构设计"}%%
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#E3F2FD',
  'primaryBorderColor': '#1976D2'
}}}%%
flowchart TB
    subgraph UI["表示层"]
        Activity[Activity]
        Fragment[Fragment]
        Compose[Jetpack Compose]
    end

    subgraph Domain["业务层"]
        UseCase[Use Case]
        Repository[Repository]
    end

    subgraph Data["数据层"]
        Local[(本地数据库)]
        Remote[远程 API]
        Cache[缓存]
    end

    Activity --> Fragment
    Fragment --> Compose
    Compose --> UseCase
    UseCase --> Repository
    Repository --> Local
    Repository --> Remote
    Repository --> Cache

    style UI fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style Domain fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
    style Data fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
```

下面是一个没有标题的图表（将自动编号）：

```mermaid
pie title 用户统计
    "活跃用户" : 60
    "沉默用户" : 25
    "流失用户" : 15
```

## 测试说明

执行以下命令测试导出功能：

```bash
# 方法 1：直接导出本文件
python scripts/export_mermaid.py test-example.md

# 方法 2：导出到指定目录
python scripts/export_mermaid.py test-example.md --output-dir ./test-output/

# 方法 3：使用深色主题
python scripts/export_mermaid.py test-example.md --theme dark
```

预期输出文件：
- `用户注册流程.png`（从 Markdown 标题提取）
- `三层架构设计.png`（从 Mermaid title 注释提取）
- `mermaid-图表-3.png`（自动编号）

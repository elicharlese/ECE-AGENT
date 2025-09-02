# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]: A
        - heading "Welcome to AGENT" [level=1] [ref=e9]
        - paragraph [ref=e10]: Sign in to access your AI-powered workspace
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]:
            - generic [ref=e14]: Email address
            - textbox "Email address" [ref=e15]
          - button "Continue" [disabled]
        - generic [ref=e16]:
          - generic [ref=e21]: Or continue with
          - button "Continue with Google" [ref=e23] [cursor=pointer]:
            - img
            - text: Continue with Google
          - button "Connect Wallet" [ref=e25] [cursor=pointer]:
            - generic [ref=e26] [cursor=pointer]:
              - img
              - text: Connect Wallet
    - generic [ref=e28]:
      - button "AI Agents" [ref=e29] [cursor=pointer]:
        - img [ref=e30] [cursor=pointer]
      - button "MCP Tools" [ref=e33] [cursor=pointer]:
        - img [ref=e34] [cursor=pointer]
  - alert [ref=e36]
```
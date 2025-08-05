graph TD
    A[User] -->|Chat|> B(Chat Engine)
    B -->|Message|> C(Toast Card Service)
    C -->|Tool Integration|> D(Tool Microservice)
    D -->|Tool Response|> C
    C -->|Toast Card|> B
    B -->|Conversation|> E(KnowledgeBase)
    E -->|Knowledge Retrieval|> F(Knowledge Microservice)
    F -->|Knowledge Response|> E
    E -->|Knowledge|> B
    B -->|User Profile|> G(User Management)
    G -->|Authentication|> H(Authentication Microservice)
    H -->|Authentication Response|> G
    G -->|Authorization|> I(Authorization Microservice)
    I -->|Authorization Response|> G

    J(Web Server) -->|API|> B
    J -->|API|> C
    J -->|API|> D
    J -->|API|> E
    J -->|API|> F
    J -->|API|> G
    J -->|API|> H
    J -->|API|> I

    K(Database) -->|Data Storage|> B
    K -->|Data Storage|> C
    K -->|Data Storage|> D
    K -->|Data Storage|> E
    K -->|Data Storage|> F
    K -->|Data Storage|> G
    K -->|Data Storage|> H
    K -->|Data Storage|> I

    L(Caching Layer) -->|Caching|> B
    L -->|Caching|> C
    L -->|Caching|> D
    L -->|Caching|> E
    L -->|Caching|> F
    L -->|Caching|> G
    L -->|Caching|> H
    L -->|Caching|> I

    M(Monitoring and Logging) -->|Monitoring|> B
    M -->|Monitoring|> C
    M -->|Monitoring|> D
    M -->|Monitoring|> E
    M -->|Monitoring|> F
    M -->|Monitoring|> G
    M -->|Monitoring|> H
    M -->|Monitoring|> I
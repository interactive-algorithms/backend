# Backend
## Routes
- GET users/*userid*
user object
- GET users

```json
{
    user : [{
        name : string
        id : string
    }]
}
```
- POST users
- PATCH users/*userid*
- POST login
```json
{
    identifier : string,
    password : string
}
```

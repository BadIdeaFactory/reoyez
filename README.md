# reOyez

## Usage

### Deployment

```
$ serverless deploy
```

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function feed
```

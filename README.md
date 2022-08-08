# Cloud Pong

### To run locally:

```text
npm run dev
```

### To deploy:

1. [Select or create a Cloud Platform project](https://console.cloud.google.com/project)
   .
2. [Enable billing for your project](https://support.google.com/cloud/answer/6293499#enable-billing) (
   learn more about [Google's Free Tier](https://cloud.google.com/free)).

Set environment variables for

* `PROJECT`
* `REGION`
* `SERVICE`

For example:

```text
export PROJECT=my-cloud-pong-project
export REGION=us-central1
export SERVICE=pong
```

From the project root directory, run the following script and enable APIs, as
prompted:

```text
scripts/run-deploy
```

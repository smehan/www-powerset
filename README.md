# www-powerset
www for powersettech

Old site is multiple pages and using sass-compass for css compilation. Needs to be redone.

## AWS bucket setup

Create the bucket: ` aws s3 mb s3://www.powersettech.com --profile bucket_admin`
then set the bucket to be a website: `aws s3 website s3://www.powersettech.com --index-document index.html --error-document error.html --profile bucket_admin`
then sync the distribution to the bucket: `aws s3 sync --acl public-read --sse --delete dist/ s3://www.powersettech.com --profile bucket_admin`


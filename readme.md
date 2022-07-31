# Insta-sham

This project was my first crack at a CRUD full-stack web application. It utilizes NextJS for the front end,
Express for the backend, and MongoDB for the database. The MERN stack. This project is expansive and by far the
one that taught me the most to date. Not only teaching me new technologies and data patterns, but it was also
valuable in conjunction with future projects in showing me things I would not do the same way moving forward.

I chose an Instagram clone as I felt it was a great middle-ground of simplicity and robustness. An app where you can
upload images and create posts, read your own and other users' posts, update and edit your posts,
and of course, delete them if you pleased. Create, read, update, and delete.

A number of the things here I would do differently moving forward, such as substituting homemade hooks for
libraries such as react form hook or react-query. Replacing homemade reusable components for component
libraries such as Chakra UI or
Mantine. Utilizing Next Auth instead of crafting middleware to handle JWT creation, encryption, and decryption,
etc. However, I far from regret my time building these out, as they have given me a deeper understanding
of how these features can be handled or troubleshot and a deeper appreciation for the open source community and
their contributions to web dev as a whole.

Another element of this project is its backend is hosted using AWS. This isn't my first project
hosted using a major cloud provider; I have used firebase in the past for smaller case studies. This is my first
to be integrated into the ecosystem so tightly.
Details of which services are used can be found below in the [tech stack](##tech-stack) section.

## Demo

**Client:** https://insta-sham.com

**API:** https://api.insta-sham.com

## Tech Stack

**Client:** React, NextJS, React Transition Group, SCSS, React Icons, Axios, Google Maps API

**Server:** Node, Express, Body Parser, Express Validator, AWS SDK, Axios, BcryptJS, JSONWebToken, Multer, Multer-S3,
Nodemailer, UUID, Mongoose, Fs-extra

**Dev Ops: (AWS)**

- Elastic Beanstalk `(hosting monolith of backend services, middleware, and API endpoints)`
- Codebuild/Code Pipeline `(for rapid deployment of changes, buildspec.yml used to orchestrate process)`
- S3 `(for image storage)`
- Route 53 `(domain registrar)`
- Certificate Manager `(https self signed certs)`
- IAM `(permissions)`

## Features

- Create posts and save to database, both with text transmitted via axios/fetch API (comments) and BLOB's via formdata API (images/posts)
- Edit and delete existing posts, with proper backend authentication
- Create (with verified user account) and read comments on posts
- Attach and display location data for posts, using Google Maps API
- Create user accounts, with avatars and email verification
- Login with existing user accounts
- Reset/change password for existing accounts, with proper email authentication
- Edit description of user accounts, displayed on profile pages
- Responsive design, with both mobile and desktop modes

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY` for the Google Maps API  
`DB_CRED` for your Mongo instance  
`SECRETKEY` for encrypting your JWTs  
`S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION` all needed to connect to your S3 bucket for image storage  
`FE_URL` to point to your client  
`HOST`, `SERVICE`, `USER`, `PASS` all needed by nodemailer for email actions

## License

[MIT](https://choosealicense.com/licenses/mit/)

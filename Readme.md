### Docker Compose for a Full-Stack Application with React, Node.js, and PostgreSQL

This repository demonstrates how to set up a React JS, Node JS server with a PostgreSQL database server inside docker containers and connect them all together

#### TL;DR

To get this project up and running, follow these steps

1. Make sure you have Docker installed in your system. For installation steps, follow the following steps:
    1. For **[Mac](https://docs.docker.com/desktop/install/mac-install/)**
    2. For **[Ubuntu](https://docs.docker.com/engine/install/ubuntu/)**
    3. For **[Windows](https://docs.docker.com/desktop/install/linux-install/)**
2. Clone the repository into your device
3. Open a terminal from the cloned project's directory (Where the `docker-compose.yml` file is present)
4. Run the command: `docker compose up`

That's all! That should get the project up and running. To see the output, you can access `http://127.0.0.1:4172` from the browser and you should find a web page with a list of users. This entire system with the client, server & database are running inside of docker and being accessible from your machine.

Here is a detailed explanation on what is going on.

#### **1. Introduction**

[Docker](https://docs.docker.com/) at its core is a platform as a service that uses OS-level virtualization to deploy/deliver software in packages called containers. It is done for various advantages, such as cross platform consistency and flexibility and scalability.

[Docker Compose](https://docs.docker.com/compose/) is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience.

#### **2. Using Docker and Docker Compose**

When it comes to working with Full Stack Applications, i.e. ones that will involve more than one set of technology to integrate it into one fully fledged system, Docker can be fairly overwhelming to configure from scratch. It is not made any easier by the fact that there are various types of environment dependencies for each particular technology, and it only leads to the risk of errors at a deployment level.

**Note:** The `.env` file adjacent in the directory with `docker-compose.yml` will contain certain variables that will be used in the docker compose file. They will be accessed whenever the `${<VARIABLE_NAME>}` notation is used.

This example will work with PostgreSQL as the database, a very minimal Node/Express JS server and React JS as the client side application.

#### **3. Individual Containers**

The following section goes into a breakdown of how the `docker-compose.yml` file works with the individual `Dockerfile`. Let's take a look at the docker-compose file first. We have a key called `services` at the very top, which defines the different applications/services we want to get running. As this is a `.yml` file, it is important to remember that indentations are crucial. Lets dive into the first service defined in this docker compose file, the database.

##### **1. Database**
First of all, the database needs to be set up and running in order for the server to be able to connect to it. The database does not need any Dockerfile in this particular instance, however, it can be done with a Dockerfile too. Lets go through the configurations.

*`docker-compose.yml`*
```yml
postgres:
    container_name: database
    ports:
        - "5431:5432"
    image: postgres
        environment:
            POSTGRES_USER: "${POSTGRES_USER}"
            POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
            POSTGRES_DB: ${POSTGRES_DB}
        volumes:
            - ./docker_test_db:/var/lib/postgresql/data
        healthcheck:
            test: ["CMD-SHELL", "sh -c 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}'"]
            interval: 5s
            timeout: 60s
            retries: 5
            start_period: 80s
```
#### Explanation
- ***postgres***: used to identify the service that the section of the compose file is for
- ***container_name***: the name of the service/container that we have chosen
- ***ports***: maps the host port (making it accessible from outside) to the port being used by the application in Docker.
- ***image***: defines the Docker image that will be required to make this container functional and running
- ***environment***: defined variables for the environment of this particular service. For example, for this PostgreSQL service, we will be defining a `POSTGRES_USER`,`POSTGRES_PASSWORD` and `POSTGRES_DB`. They're all being assigned with the values in the `.env`.
- ***volumes***: This particular key is for we want to create a container that can **_persist_** data. This means that ordinarily, when a Docker container goes down, so does any updated data on it. Using volumes, we are mapping a particular directory of our local machine with a directory of the container. In this case, that's the directory where postgres is reading the data from for this database.
- ***heathcheck***: when required, certain services will need to check if their state is functional or not. For example, PostgreSQL, has a behavior of turning itself on and off a few instances at launch, before finally being functional. For this reason, healthcheck allows Docker Compose to allow other services to know when it is fully functional.
    The few properties below healthcheck are doing the following:
    - ***test***: runs particular commands for the service to run checks
    - ***interval***: amount of time docker compose will wait before running a check again
    - ***timeout***: amount of time that the a single check will go on for, before it times out without any response or fails
    - ***retries***: total number of tries that docker compose will try to get the healthcheck for a positive response, otherwise fail and declare it as a failed check
    - ***start_period***: specifies the amount of time to wait before starting health checks

##### **2. Server**

*`Dockerfile`*
```Dockerfile
FROM node:18
WORKDIR /server
COPY src/ /server/src
COPY prisma/ /server/prisma
COPY package.json /server
RUN npm install
RUN npx prisma generate
```
**Explanation**
***FROM*** - tells Docker what image is going to be required to build the container. For this example, its the Node JS (version 18)
***WORKDIR*** - sets the current working directory for subsequent instructions in the Dockerfile. The `server` directory will be created for this container in Docker's environment
***COPY*** - separated by a space, this command tells Docker to copy files/folders ***from local environment to the Docker environment***. The code above is saying that all the contents in the src and prisma folders need to be copied to the `/server/src` & `/srver/prisma` folders in Docker, and package.json to be copied to the `server` directory's root.
***RUN*** - executes commands in the terminal. The commands in the code above will install the necessary node modules, and also generate a prisma client for interacting with the database (it will be needed for seeding the database initially).

*`docker-compose.yml`*
```yml
server:
    container_name: server
    build:
        context: ./server
        dockerfile: Dockerfile
    ports:
        - "7999:8000"
    command: bash -c "npx prisma migrate reset --force && npm start"
    environment:
        DATABASE_URL: "${DATABASE_URL}"
        PORT: "${SERVER_PORT}"
    depends_on:
        postgres:
            condition: service_healthy
```
**Explanation**
***build***: defines the build context for the container. This can contain steps to build the container, or contain path to Dockerfiles that have the instructions written. The ***context*** key directs the path, and the ***dockerfile*** key contains the name of the Dockerfile.
***command***: executes commands according to the instructions that are given. This particular command is executed to first make migrations to the database and seed it, and then start the server.
***environment***: contains the key-value pairs for the environment, which are available in the .env file at the root directory. `DATABASE_URL` and `PORT` both contain corresponding values in the .env file.
***depends_on***: checks if the dependent container is up, running and functional or not. This has various properties, but in this example, it is checking if the `service_healthy` flag of our postgres container is up and functional or not. The `server` container will only start if this flag is returned being `true` from the ***healthcheck*** from the PostgreSQL 

##### **3. Client**

*`Dockerfile`*
```Dockerfile
FROM node:18
ARG VITE_SERVER_URL=http://127.0.0.1:7999
ENV VITE_SERVER_URL=$VITE_SERVER_URL
WORKDIR /client
COPY public/ /client/public
COPY src/ /client/src
COPY index.html /client/
COPY package.json /client/
COPY vite.config.js /client/
RUN npm install
RUN npm run build
```
**Explanation**
Note: *The commands for `client` are very similar to the already explained above for `server`*
***ARG***: defines a variable that is later passed to the ***ENV*** instruction
***ENV***: Assigns a key value pair into the context of the Docker environment for the container to run. This essentially contains the domain of the API that will be fired from the client later.

*`docker-compose.yml`*
```yml
client:
    container_name: client
    build:
        context: ./client
        dockerfile: Dockerfile
    command: bash -c "npm run preview"
    ports:
        - "4172:4173"
    depends_on:
        - server
```
**Explanation**
Note: *The commands for `client` are very similar to the already explained above for `server` and `postgres`*

This tutorial provides a basic understanding of using Docker Compose to manage a full-stack application. Explore the code and docker-compose.yml file for further details.
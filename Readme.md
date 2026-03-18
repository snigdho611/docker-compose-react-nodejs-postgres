### Docker Compose for a Full-Stack Application with React, Node.js, TypeScript, and PostgreSQL

This repository demonstrates how to set up a React TypeScript client, Node.js TypeScript server with Prisma 7 ORM and a PostgreSQL database server inside docker containers and connect them all together

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

This example will work with PostgreSQL 18 as the database, a TypeScript-based Node/Express server with Prisma 7 ORM, and React TypeScript (with Vite) as the client side application.

**Important:** This boilerplate uses **Prisma 7**, which introduces several breaking changes from Prisma v6:
- Database connection URL is stored in `prisma.config.ts` instead of the schema file
- Prisma Client is generated to a custom output directory (`prisma/generated/`)
- Uses the new `@prisma/adapter-pg` for PostgreSQL connections
- Seed command configuration is defined in `prisma.config.ts`

#### **3. Individual Containers**

The following section goes into a breakdown of how the `docker-compose.yml` file works with the individual `Dockerfile`. Let's take a look at the docker-compose file first. We have a key called `services` at the very top, which defines the different applications/services we want to get running. As this is a `.yml` file, it is important to remember that indentations are crucial. Lets dive into the first service defined in this docker compose file, the database.

##### **1. Database**
First of all, the database needs to be set up and running in order for the server to be able to connect to it. The database does not need any Dockerfile in this particular instance, however, it can be done with a Dockerfile too. Lets go through the configurations.

*`docker-compose.yml`*
```yml
postgres:
    container_name: database
    image: postgres:18-alpine
    ports:
        - "5431:5432"
    environment:
        POSTGRES_USER: "${POSTGRES_USER}"
        POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
        POSTGRES_DB: ${POSTGRES_DB}
    volumes:
        - ./docker_test_db:/var/lib/postgresql
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
- ***image***: defines the Docker image that will be required to make this container functional and running. We're using PostgreSQL version 18 with the Alpine Linux variant for a smaller image size
- ***ports***: maps the host port (making it accessible from outside) to the port being used by the application in Docker
- ***environment***: defined variables for the environment of this particular service. For example, for this PostgreSQL service, we will be defining a `POSTGRES_USER`,`POSTGRES_PASSWORD` and `POSTGRES_DB`. They're all being assigned with the values in the `.env`.
- ***volumes***: This particular key is for we want to create a container that can **_persist_** data. This means that ordinarily, when a Docker container goes down, so does any updated data on it. Using volumes, we are mapping a particular directory of our local machine with a directory of the container. In this case, that's the directory where postgres is reading the data from for this database.
- ***heathcheck***: when required, certain services will need to check if their state is functional or not. For example, PostgreSQL, has a behavior of turning itself on and off a few instances at launch, before finally being functional. For this reason, healthcheck allows Docker Compose to allow other services to know when it is fully functional.
    The few properties below healthcheck are doing the following:
    - ***test***: runs particular commands for the service to run checks
    - ***interval***: amount of time docker compose will wait before running a check again
    - ***timeout***: amount of time that the a single check will go on for, before it times out without any response or fails
    - ***retries***: total number of tries that docker compose will try to get the healthcheck for a positive response, otherwise fail and declare it as a failed check
    - ***start_period***: specifies the amount of time to wait before starting health checks

##### **2. Server (TypeScript with Prisma 7)**

*`Dockerfile`*
```Dockerfile
FROM node:22-alpine
WORKDIR /server
COPY . .
RUN npm install
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build && npm run start"]
```
**Explanation**
***FROM*** - tells Docker what image is going to be required to build the container. For this example, it's Node.js version 22 with Alpine Linux for a smaller image size.
***WORKDIR*** - sets the current working directory for subsequent instructions in the Dockerfile. The `server` directory will be created for this container in Docker's environment.
***COPY . .*** - copies all files from the local server directory to the Docker environment. A `.dockerignore` file should exclude `node_modules`, `dist`, and other build artifacts.
***RUN*** - executes commands during the image build. Here we install the necessary node modules.
***CMD*** - defines the command that runs when the container starts. This command:
    1. Generates the Prisma client (outputs to `prisma/generated/` directory)
    2. Runs database migrations
    3. Seeds the database with initial data (configured in `prisma.config.ts`)
    4. **Compiles TypeScript to JavaScript** using `npm run build` (runs `tsc`)
    5. Starts the compiled server from the `dist/` directory

*`docker-compose.yml`*
```yml
server:
    container_name: server
    build:
        context: ./server
        dockerfile: Dockerfile
    ports:
        - "7999:8000"
    environment:
        DATABASE_URL: "${DATABASE_URL}"
        PORT: "${SERVER_PORT}"
    depends_on:
        postgres:
            condition: service_healthy
```
**Explanation**
***build***: defines the build context for the container. This can contain steps to build the container, or contain path to Dockerfiles that have the instructions written. The ***context*** key directs the path, and the ***dockerfile*** key contains the name of the Dockerfile.
***ports***: maps port 7999 on the host to port 8000 in the container, making the server accessible at `http://localhost:7999`.
***environment***: contains the key-value pairs for the environment, which are available in the .env file at the root directory. `DATABASE_URL` and `PORT` both contain corresponding values in the .env file.
***depends_on***: checks if the dependent container is up, running and functional or not. This has various properties, but in this example, it is checking if the `service_healthy` flag of our postgres container is up and functional or not. The `server` container will only start if this flag is returned being `true` from the ***healthcheck*** from the PostgreSQL container. The startup commands (Prisma client generation, migrations, seeding, TypeScript compilation, and server start) are defined in the Dockerfile's CMD instruction.

**TypeScript Configuration:**
The server uses TypeScript with the following key configurations:
- Source files: `.ts` files in the `src/` directory (e.g., `app.ts`, `database.ts`)
- Compiled output: JavaScript files in the `dist/` directory
- Development: Uses `tsx watch` for hot-reloading during development
- Production: TypeScript is compiled to JavaScript using `tsc` before the server starts
- Seed file: `prisma/seed.ts` (TypeScript)

**Prisma 7 Specific Configuration:**

*`prisma.config.ts`*
```typescript
import { defineConfig, env, PrismaConfig } from 'prisma/config';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
})  satisfies PrismaConfig;
```

*`prisma/schema.prisma`* (Key differences from Prisma v6):
```prisma
generator client {
  provider = "prisma-client"    // Changed from "prisma-client-js"
  output   = "./generated"       // Custom output location
}

datasource db {
  provider = "postgresql"        // No url field - moved to prisma.config.ts
}
```

**Key Features of Prisma 7:**
- **Separate Configuration File**: `prisma.config.ts` centralizes all Prisma configuration
- **Custom Client Output**: Prisma Client is generated to `prisma/generated/` instead of `node_modules/@prisma/client`
- **Database Adapter**: Uses `@prisma/adapter-pg` for PostgreSQL connections
- **TypeScript-First**: Native TypeScript support for configuration files
- **Seed Configuration**: Seed command is defined in `prisma.config.ts` instead of package.json 

##### **3. Client (React TypeScript)**

*`Dockerfile`*
```Dockerfile
FROM node:22-alpine
ARG VITE_SERVER_URL=http://127.0.0.1:7999
ENV VITE_SERVER_URL=$VITE_SERVER_URL
WORKDIR /client
COPY . .
RUN npm install
RUN npm run build
```
**Explanation**
Note: *The commands for `client` are very similar to those already explained above for `server`*
***FROM***: Uses Node.js version 22 with Alpine Linux for a smaller image size.
***ARG***: defines a build-time variable that can be passed during the Docker build process.
***ENV***: Assigns a key-value pair into the Docker environment for the container to run. This contains the API server URL that the client will use to make requests.
***COPY . .***: Copies all necessary files from the client directory. A `.dockerignore` file should be used to exclude `node_modules` and other unnecessary files.
***RUN npm install***: Installs dependencies.
***RUN npm run build***: Builds the production-ready React TypeScript application using Vite, which includes:
    1. TypeScript compilation (`tsc -b`)
    2. Bundling and optimization (`vite build`)
    3. Output generated in the `dist/` directory

*`docker-compose.yml`*
```yml
client:
    container_name: client
    build:
        context: ./client
        dockerfile: Dockerfile
    command: ["sh", "-c", "npm run preview"]
    ports:
        - "4172:4173"
    depends_on:
        - server
```
**Explanation**
Note: *The commands for `client` are very similar to those already explained above for `server` and `postgres`*
***command***: runs the Vite preview server to serve the built application.
***ports***: maps the host port 4172 (accessible from the browser) to the container port 4173 where Vite preview server runs.
***depends_on***: ensures the server container is started before the client container.

**TypeScript Configuration:**
The client uses React with TypeScript:
- Source files: `.tsx` files for components (e.g., `App.tsx`, `main.tsx`) and `.ts` for utilities
- TypeScript project references: Uses `tsconfig.app.json` and `tsconfig.node.json` for optimized build
- Build process: Compiles TypeScript and bundles with Vite
- Configuration: `vite.config.ts` instead of `.js`

#### **4. Technology Stack**

This project uses the following versions and technologies:
- **Programming Language**: TypeScript v5.9.x
- **Node.js**: v22 (Alpine Linux)
- **PostgreSQL**: v18 (Alpine Linux)
- **Server:**
  - Express: v5.x
  - **Prisma: v7.5.x** (Latest Prisma ORM with breaking changes from v6)
  - **@prisma/adapter-pg**: v7.5.x (PostgreSQL adapter for Prisma 7)
  - tsx: v4.x (TypeScript execution for development)
  - TypeScript compiler target: ES2024
- **Client:**
  - React: v19.x
  - React Router: v7.x
  - Vite: v8.x (build tool)
  - TypeScript: v5.9.x

#### **5. Prisma 7 Migration Notes**

If migrating from Prisma v6 to v7, be aware of these key changes:
1. **Configuration**: Create `prisma.config.ts` and move datasource URL from `schema.prisma`
2. **Generator**: Update `provider` from `"prisma-client-js"` to `"prisma-client"`
3. **Output Location**: Specify custom `output` in generator block (e.g., `"./generated"`)
4. **Import Path**: Update imports from `@prisma/client` to `prisma/generated/client`
5. **Adapter**: Add `@prisma/adapter-pg` dependency for PostgreSQL
6. **Seed Configuration**: Move seed command from `package.json` to `prisma.config.ts`

This tutorial provides a basic understanding of using Docker Compose to manage a full-stack TypeScript application with Prisma 7. Explore the code, TypeScript configuration files (`tsconfig.json`), Prisma configuration (`prisma.config.ts`), and docker-compose.yml file for further details.
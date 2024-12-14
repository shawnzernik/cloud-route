# TS React Express (TRE)

The following is intended to be base code providing functionality for a modular system by which you can build a fully functional web application.  The intent is to keep it as lean as possible.

## 1. License

TS React Express (TRE)

Copyright (C) 2024 Shawn Zernik

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

Also add information on how to contact you by electronic and paper mail.

If your software can interact with users remotely through a computer network, you should also make sure that it provides a way for users to get its source. For example, if your program is a web application, its interface could display a "Source" link that leads users to an archive of the code. There are many ways you could offer source, and different solutions will be better for different programs; see section 13 for the specific requirements.

You should also get your employer (if you work as a programmer) or school, if any, to sign a "copyright disclaimer" for the program, if necessary. For more information on this, and how to apply and follow the GNU AGPL, see <https://www.gnu.org/licenses/>.

## 2. TS React Express

This is an application bootstrapping framework.  It's a full stack system written in TypeScript:

- Backend  
  TypeScript & Express
- Frontend  
  TypeScript & React
- Data  
  PostgreSQL & TypeORM

### 2.1. Functional Requirements

- Authentication
  This includes logging in, password resets, and user tokens.
- Authorizations
  This is a RBAC / group based security system. This includes users, groups, memberships, securables, and permissions.
- Lists
  To speed development, the system has a list functionality.  This provides list filtering and linking to an edit screen.  Each list should
- Navigation
  This is the menu system.  Each menu
- Settings
  This is a list of client side setting that the users can see.  All server side and private settings should be stored in `backend/src/Config.ts` or passed as environment variables to the application.

## 3. Getting Up and Running

### 3.1 Setup the Database

Create the database using Podman.  Their is a shell script in `postgres/create.sh`.  Once the database is up and running, run the scripts to create the database.  The following are the command to use:

```
cd postgres
./create.sh
cd ../database
./create-db.sh
```

### 3.2 Configuration

Edit the config file in `backend/src/Config.ts`.

### 3.3 NPM Install and Build

We'll need to install NPM dependencies and build each of the components:

```
cd common
npm install
npm run build

cd ../backend
npm install
npm run build

cd ../frontend
npm install
npm run build
```

### 3.4 Running the Application

```
cd backend
npm run run
```

## 4. Building Your Application

[To build your application, look at the `backend/src/app/readme.md`.](./backend/src/app/readme.md)

## 5. Containerization

This application both uses containers, and can be a container.  First, we'll need Postgres access.  To configure to containers, we're using podman.  Start by creating the network and then the two containers:

```
podman network ls
podman network create --driver=bridge lvt

cd postgres
./create.sh

cd ..
./podman.sh
```

You should now be able to connect to the website:

`https://localhost:4433`

For further configuration, use environment variables to override the config file.

## 5. To Do

The following is a list of features, enhancements, and remediation to be implemented.

- List view.
  - For each group of SQL datatypes (string, number, date/time) we need to implement filtering in the backend/db.
  - Need the ability to sort lists (default in initial dataset, and in browser when results are returned).
  - Add setting to list indicating the reload of the list is required when "back" is selected rather than reloading the whole page.
- Menu option is a securable.
  - The securable should be checked when showing the menu options.
  - The securable should also be checked when requesting a list of menu options - it should only return from the server the menu options the user has access to.
  - On CRUD of the menu option, the associated securable should be CRUD'ed as needed.
- List is a securable.
  - The securable should be checked when accessing the list.
  - The securable should also be checked when requesting a list of list from the REST APIs - it should only return from the server the lists the user has access to.  
  - On CRUD of the list, the associated securable should be CRUD'ed as needed.  
  - The SQL executed on the server side does not come from the list object passed from the client, but a fresh copy loaded from the DB.
- Move all settings that are secret to the server side.
- Convert all shell scripts to PowerShell for Windows.

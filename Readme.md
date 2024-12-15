# Image Upload Project

This project is a web application that allows users to upload and manage images and their associated mask files. The backend is built using FastAPI, and the frontend is built using React.

## How to Run the Project Locally

### Prerequisites:
Make sure you have the following installed:
- Python (>=3.8)
- Node.js (>=14)
- npm or yarn (for managing frontend dependencies)

### Backend (FastAPI):

1. Clone the repository:

```bash
   git clone https://github.com/your-username/image-upload-app.git
   cd /backend
```


2. Clone the repository:

```bash
  python -m venv env
source env/bin/activate
```

3. Install the required Python packages:

```bash
  pip install fastapi uvicorn pymongo motor python-dotenv
```
4. Set up environment variables (e.g., in a .env file):

```bash
# Example .env file
MONGODB_URI='your_mongodb_connection_string'
PORT=8000
UPLOAD_DIR='./uploads'
```
5. Run the backend server:

```bash
Copy code
uvicorn main:app --reload
```
The API should now be running on http://localhost:8000.



###  Frontend (React):

1. Navigate to the frontend directory:

```bash
   cd /frontend
```

2. Install the required dependencies:

```bash
 npm install
```

3. Start the React development server:

```bash
  npm run dev
```
The API should now be running on http://localhost:5173.



## Libraries Used
##3 Backend (FastAPI):
 - FastAPI
 - Motor
 - Uvicorn
 - Python-dotenv

## Frontend (React):

 - React
 - Tailwind CSS
 - FabricJs
 - Typescript


### Challenges

  **Old API Documentation After Recent Update:**
  Working with Fabric.js after its recent update presented a few challenges, primarily due to the messy and unclear API documentation. The disorganized documentation made it difficult to understand the changes and properly implement certain features. To address this, I relied on community-driven resources, such as forums and GitHub issues, where developers shared solutions to common problems. I also examined the source code itself to understand the updated methods and behavior, often experimenting with different API calls to find what worked best for my use case. In some instances, I referred to older versions of the documentation to ensure compatibility across updates.

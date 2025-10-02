#!/bin/bash
cd /home/kavia/workspace/code-generation/study-notes-hub-171069-171078/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


FROM node:alpine3.11

# copy the nodejs app to the image
COPY servers/batch-cache /server
# change working directory
WORKDIR /server
# install my-app dependencies
RUN npm install
RUN npm update

# expose port to containers, should match the port used for listening in my-app
EXPOSE 4000

# run my- app
CMD ["node", "/server/index.js"]

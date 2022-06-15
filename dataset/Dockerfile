FROM postgres

WORKDIR /dataset
COPY university*.sql /dataset/
# Create database
ENV POSTGRES_USER admin
ENV POSTGRES_PASSWORD password
ENV POSTGRES_DATABASE linbenchmark

# Move the sql files so they are executed during container startup
COPY schema_university_psql.sql /docker-entrypoint-initdb.d/

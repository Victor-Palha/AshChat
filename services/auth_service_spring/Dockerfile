# Stage 1: Build Stage
FROM maven:3.9-eclipse-temurin-23-alpine as builder

# Set working directory inside the container
WORKDIR /app

# Copy the Maven project files into the container
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime Stage
FROM eclipse-temurin:23-jre-alpine

# Set a non-root user for better security
RUN adduser -D -u 1000 springbootuser

# Set working directory inside the container
WORKDIR /app

# Copy the Spring Boot JAR from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the application port
EXPOSE 3005

ENV SPG_RABBITMQ_URI=${SPG_RABBITMQ_URI}
ENV SPG_DATABASE_URI=${SPG_DATABASE_URI}
ENV SPG_SERVER_PORT=${SPG_SERVER_PORT}
ENV SPG_JWT_REFRESH=${SPG_JWT_REFRESH} 
ENV SPG_JWT_TEMPORARY=${SPG_JWT_TEMPORARY} 

# Use the non-root user
USER springbootuser

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
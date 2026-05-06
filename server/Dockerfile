FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . .
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test
EXPOSE 8080
CMD ["java", "-jar", "build/libs/server-0.0.1-SNAPSHOT.jar"]
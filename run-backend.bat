@echo off
echo ========================================================
echo   Starting TestFusion Spring Boot Backend (Port 8080)
echo ========================================================

:: Detect JDK 17+ (JDK 25 installed on system)
if exist "C:\Program Files\Java\jdk-25" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-25"
) else if exist "C:\Program Files\Java\latest" (
    set "JAVA_HOME=C:\Program Files\Java\latest"
)
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: Detect Maven
set "MVN_CMD=mvn"
if exist "C:\Users\ANJI\PDD-smileguard\tools\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=C:\Users\ANJI\PDD-smileguard\tools\apache-maven-3.9.6\bin\mvn.cmd"
) else if exist "C:\PDD-smileguard\tools\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=C:\PDD-smileguard\tools\apache-maven-3.9.6\bin\mvn.cmd"
)

cd /d "%~dp0backend"
echo Using JAVA_HOME: %JAVA_HOME%
echo Using Maven: %MVN_CMD%
echo.
echo Launching Spring Boot Backend...
call "%MVN_CMD%" spring-boot:run
pause


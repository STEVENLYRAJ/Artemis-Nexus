@echo off
echo Compiling Java Wrapper...
javac Main.java
if %errorlevel% neq 0 (
    echo Compilation failed! Make sure JDK is installed and in PATH.
    pause
    exit /b %errorlevel%
)
echo Running hybrid application...
java Main
pause

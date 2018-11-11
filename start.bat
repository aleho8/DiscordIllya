@echo off
title Illya
:run
node mainprocess.js
if %ERRORLEVEL% EQU 66 goto:run
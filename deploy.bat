@echo off
SET /P message=Entrez votre message de commit: 
git add .
git commit -m "%message%"
git push
vercel --prod 
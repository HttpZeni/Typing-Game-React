echo "Switching to branch main"
git checkout main

echo "Building app..."
npm run build

echo "Deploying files to server..."
scp -r dist/* zeni@192.168.2.100:/var/www/httpzeni.com/

echo "Done :D"

sudo apt-get install -y gnupg curl ca-certificates apt-transport-https
curl -fsSL https://pgp.mongodb.com/server-6.0.asc   | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] \ https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse"   | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt-get install -y gnupg
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc   | sudo apt-key add -
apt-key list | grep -A2 6A26B1AE64C3C388
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo sed -i 's/^\s*bindIp:.*/  bindIp: 0.0.0.0/' /etc/mongod.conf
sudo systemctl enable mongod
sudo systemctl restart mongod
sudo ss -tlnp | grep mongod

sudo apt-get update
sudo apt-get install -y mongodb-database-tools
mongosh "mongodb+srv://nil:nil@cs308-ecommerce-cluster.gjvsb.mongodb.net/?retryWrites=true&w=majority&appName=cs308-ecommerce-cluster"
mongodump   --archive=/tmp/atlas-backup.archive   --gzip
mongorestore   --gzip   --archive=/tmp/atlas-backup.archive   --nsFrom="cs308db.*"   --nsTo="cs308db.*"   --drop

mongosh --eval "db.getSiblingDB('cs308db').getCollectionNames()"

mongosh "mongodb+srv://nil:nil@cs308-ecommerce-cluster.gjvsb.mongodb.net/?retryWrites=true&w=majority"   --quiet   --eval "printjson(db.adminCommand({ listDatabases: 1 }).databases.map(d => d.name))"
mongodump   --uri="mongodb+srv://nil:nil@cs308-ecommerce-cluster.gjvsb.mongodb.net/CS308-DB?retryWrites=true&w=majority"   --db="CS308-DB"   --archive=/tmp/atlas-backup.archive   --gzip
mongorestore   --gzip   --archive=/tmp/atlas-backup.archive   --nsFrom="CS308-DB.*"   --nsTo="cs308db.*"   --drop
mongosh --quiet --eval "
    const db = db.getSiblingDB('cs308db');
    print('products count:', db.products.countDocuments());
    "
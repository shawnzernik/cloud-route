#! /bin/sh

cd ..
. env.sh
cd terraform

set -x
set -e

instance_id=$1
instance_eip_address=$2
name=$3

set +x
echo "----------------------------------------"
echo "Permissions on PEM files"
echo "----------------------------------------"
set -x

chmod 0600 ../logins/*.pem

set +x
echo "----------------------------------------"
echo "Create login script"
echo "----------------------------------------"
set -x

cat <<EOL > ../logins/$name.sh
#! /bin/sh

ssh ubuntu@$instance_eip_address -i $name.pem

EOL

set +x
echo "----------------------------------------"
echo "Login script permissions"
echo "----------------------------------------"
set -x

chmod +x ../logins/*.sh

set +x
echo "----------------------------------------"
echo "Waiting for instance running"
echo "----------------------------------------"
set -x

aws ec2 wait instance-running --instance-ids "$instance_id"

set +x
echo "----------------------------------------"
echo "Waiting for instance OK"
echo "----------------------------------------"
set -x

aws ec2 wait instance-status-ok --instance-ids "$instance_id"

set +x
echo "----------------------------------------"
echo "Run deploy script"
echo "----------------------------------------"
set -x

cd ../..
. deploy-to-vm.sh $instance_eip_address ubuntu ./terraform/logins/$name.pem
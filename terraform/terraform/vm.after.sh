#! /bin/sh

set -x
set -e

instance_id=$1
instance_eip_address=$2
name=$3
env=$4

cd ..
. env.sh $env
cd terraform

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

cat <<EOL > ../logins/$name.$env.sh
#! /bin/sh

ssh ubuntu@$instance_eip_address -i $name.pem

EOL

set +x
echo "----------------------------------------"
echo "Create read me"
echo "----------------------------------------"
set -x

cat <<EOL > ../logins/$name.$env.md
# Virtual Machine

## $env Environment

- **Name**: $name
- **External IP**: $instance_eip_address
- **Instance ID**: $instance_id  

SSH to Public IP:

\`\`\`
ssh ubuntu@$instance_eip_address -i $name.$env.pem
\`\`\`

Public Website:

\`\`\`
https://$instance_eip_address:4433
\`\`\`

- **User Name**: administrator@localhost
- **Password**: Welcome123

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
. deploy-to-vm.sh $instance_eip_address ubuntu ./terraform/logins/$name.$env.pem

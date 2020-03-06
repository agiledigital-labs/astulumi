import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { AuroraPostgresqlEngine } from "@pulumi/aws/rds";
import { v4 } from "what-is-my-ip-address";

const config = new pulumi.Config();
const dbPassword = config.getSecret("dbPassword");
const dbOpen = config.getBoolean("dbOpen");

const cidrBlocks = dbOpen ? v4().then(ip => [`${ip}/32`]) : [];

const dbSecurityGroup = new aws.ec2.SecurityGroup("astulumi-db-sg", {
  ingress: [
    {
      cidrBlocks,
      toPort: 5432,
      fromPort: 5432,
      protocol: "tcp"
    }
  ]
});

const database = new aws.rds.Instance("astlumi-db", {
  instanceClass: "db.t2.micro",
  engine: "postgres",
  allocatedStorage: 20,
  password: dbPassword,
  username: "astulumi",
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  publiclyAccessible: true
});

exports.databaseHost = database.endpoint;

const fs = require("fs");

const docs = fs.readFileSync("data.json");
const data = JSON.parse(docs);

const people = data["Sheet1"];

const newData = [];

const empty = (val) => {
  return val ? val : "";
};

for (const person of people) {
  const newUser = {
    userRefId: person["User Id"],
    mailId: empty(person["Email"]),
    parentRefId: person["Ref"],
    team: person["Team"],
    isLeft: person["Team"] === "Left",
    isRight: person["Team"] === "Right",
    joiningDate: new Date(),
    password: `${empty(person["Password"])}`,
    mobileNumber: `${empty(person["Phone no"])}`,
    name: empty(person["Name"]),
    gender: empty(person["Gender"]),
    address: empty(person["Address"]),
    stackingDate: person["Stacking"] ? new Date() : "",
    city: empty(person["City"]),
    country: "India",
  };
  newData.push(newUser);
}

const peopleData = {Sheet1: newData};

const doc = JSON.stringify(peopleData);
fs.writeFileSync("newData.json", doc);

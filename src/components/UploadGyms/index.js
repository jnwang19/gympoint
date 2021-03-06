import React, { Component } from 'react';

import { FirebaseContext } from '../Firebase';

const UploadGyms = () => (
  <div>
    <h1>Upload Gyms</h1>
    <FirebaseContext.Consumer>
      {firebase => <UploadGymsForm firebase={firebase} />}
    </FirebaseContext.Consumer>
  </div>
);

const DAYS = {
  Mon: 1,
  Tues: 2,
  Wed: 3,
  Thurs: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

class UploadGymsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
     name: "",
     street: "",
     city: "",
     state: "",
     zip: "",
     coordinates: {lat: 0, long: 0},
     initation_fee: 0,
     monthly_fee: 0,
     phone: "",
     website: "",
     hours: {},
     type: [],
     rating: 0,
     classes: [],
     amenities: []
    };
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  addGym = event => {
    const { name, address } = this.state;

    this.props.firebase
      .doCreateGym(name, address)
      .then(() => {
        this.setState({
          name: "",
          address: ""
        });
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  handleFiles = files => {
    if (window.FileReader) {
      this.getAsText(files[0]);
    } else {
      alert('FileReader is not supported in this browser.');
    }
  };

  getAsText = file => {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = this.loadHandler;
    reader.onerror = this.errorHandler;
  };

  loadHandler = event => {
    var csv = event.target.result;
    this.processData(csv);
  };

  processData = csv => {
    var text = csv.split(/\r\n|\n/);

    for (var i = 0; i < text.length; i++) {
      var data = text[i].split(/,\s*(?=(?:[^"]|"[^"]*")*$)/g);
      var name = data[0].replace(/\"/g, "");
      var street = data[1].replace(/\"/g, "");
      var city = data[2].replace(/\"/g, "");
      var state = data[3].replace(/\"/g, "");
      var zip = data[4].replace(/\"/g, "");
      var coordsList = data[5].split("|");
      var coordinates = {lat: coordsList[0].replace(/\"/g, "").parseFloat(), long: coordsList[1].replace(/\"/g, "").parseFloat()};
      var phone = data[6].replace(/\"/g, "");
      var website = data[7].replace(/\"/g, "");
      var initiation_fee = data[8].replace(/\"/g, "").parseFloat();
      var monthly_fee = data[9].replace(/\"/g, "").parseFloat();
      var session_fee = data[10].replace(/\"/g, "").parseFloat();
      var hoursList = data[11].split("|");
      var hours = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: []
      };
      for (let j = 0; j < hoursList.length; j++) {
        var hoursListSplit = hoursList[j].split(":");
        var days = hoursListSplit[0].split("-");
        var times = hoursListSplit[1].split(" ");
        for (let k = DAYS[days[0]]; k <= DAYS[days[days.length - 1]]; k++) {
          for (let l = 0; l < times.length; l++) {
            var timeRange = times[l].split("-");
            var timeObject = {start: timeRange[0], end: timeRange[1]}
            hours[DAYS[days[0]]].push(timeObject);
          }
        }
      }
      var type = [];
      var typeList = data[12].split("/");
      for (let j = 0; j < typeList.length; j++) {
        type.push(typeList[j]);
      }
      var studio_type = [];
      var studioTypeList = data[13].split("|");
      for (let j = 0; j < studioTypeList.length; j++) {
        studio_type.push(studioTypeList[j]);
      }
      var rating = data[14].replace(/\"/g, "").parseFloat();
      var classesList = data[15].split("|");
      var classes = [];
      for (let j = 0; j < classesList.length; j++) {
        classes.push(classesList[j]);
      }
      var amenitiesList = data[16].split("|");
      var amenities = [];
      for (let j = 0; j < amenitiesList.length; j++) {
        amenities.push(amenitiesList[j]);
      }
      this.props.firebase.doCreateGym(name, street, city, state, zip, coordinates, initiation_fee, monthly_fee, phone, website, hours, type, rating, classes, amenities);
    }
  };

  errorHandler = event => {
    if (event.target.error.name === "NotReadableError") {
      alert("Cannot read file!");
    }
  };

  render() {
    const {
      name,
      address,
    } = this.state;

    return (
      <div>
        <form onSubmit={this.addGym}>
          <input
            type="text"
            name="name"
            value={name}
            placeholder="Name"
            onChange={this.onChange}
          />
          <input
            type="text"
            name="address"
            value={address}
            placeholder="Address"
            onChange={this.onChange}
          />
          <button type="submit">Submit</button>
        </form>

        <input
          type="file"
          id="csvInput"
          onChange={(e) => this.handleFiles(e.target.files)}
          accept=".csv"
        />
      </div>
        );
      }
   }

export default UploadGyms;

export { UploadGymsForm };

import React, { Component } from 'react';
import { Row, Col, Button, ButtonGroup } from 'reactstrap';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { HistogramChart } from './HistogramChart';
import { trackPromise } from "react-promise-tracker";
const devSite = "localhost:5000";
//const devSite = "pchlmap.1gb.ru";

export class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [], loading: true, lifeTimeData: [[]], rollingRetentionXday: "", NewRegistrationField: "", NewActivityField: ""
        };
        this.onFieldChange = this.onFieldChange.bind(this);
        this.ConvertCalculatedData = this.ConvertCalculatedData.bind(this);
        this.onNewUserRegistrationChange = this.onNewUserRegistrationChange.bind(this);
        this.onNewUserActivityChange = this.onNewUserActivityChange.bind(this);
        this.addUser = this.addUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.loadData();

    }
    async loadData() {
        const response = await trackPromise(fetch('Home'));
        const data = await response.json();
        this.setState({ users: data, loading: false });
    }
    onFieldChange(e, id) {
        let FieldName = e.target.name;
        let FieldValue = e.target.value;
        this.setState(prevState => ({ users: prevState.users.map(x => x.id === id ? { ...x, [FieldName]: FieldValue } : x) }));
    }
  
    async calculate(users) {
        if (users) {
            var url = new URL("http://" + devSite + "/Home/Calculate");
            trackPromise(fetch(url, {
                method: 'POST',
                body: JSON.stringify(users),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json()).then(data => {
                this.setState({ rollingRetentionXday: data.rollingRetentionXday, lifeTimeData: this.ConvertCalculatedData(data) });
            }).then(() => {
                this.loadData();
            }));
        }
    }
    ConvertCalculatedData(_data) {
        let datesData = _data.lifeTimeData;
        //alert(JSON.stringify(datesData));
        //let objKeys = Object.keys(datesData);
        //let fieldname_One = objKeys[0];
        //let fieldname_Two = objKeys[1]; 
        let result = [['id', 'life time']];
        datesData.forEach(el => {
            result.push([el.id, el.lifeTime]);
        });
        return result;

    }
    onNewUserRegistrationChange(e) {
        this.setState({ NewRegistrationField: e.target.value });
    }
    onNewUserActivityChange(e) {
        this.setState({ NewActivityField: e.target.value });
    }
    addUser() {
        if (this.state.NewActivityField != "" && this.state.NewRegistrationField != "") {
            let data = { id: "new", RegistrationDate: this.state.NewRegistrationField, LastActivity: this.state.NewActivityField };
            var url = new URL("http://" + devSite + "/home/AddUser");
            trackPromise(fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(() => { this.loadData(); }));
        }
    }
    deleteUser(id) {
        let data = { id: "new", RegistrationDate: this.state.NewActivityField, LastActivity: this.state.NewRegistrationField };
        var url = new URL("http://" + devSite + "/Home");
        url.search = new URLSearchParams({ id: id });
        trackPromise(fetch(url, {
            method: 'DELETE',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => { this.loadData(); }));

    }
    onSubmit(e, users) {
        e.preventDefault();
        if (users) {
            var url = new URL("http://" + devSite + "/Home");
            trackPromise(fetch(url, {
                method: 'POST',
                body: JSON.stringify(users),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(() => {
                this.loadData();
            }));
        }
    }
    render() {
        var users = this.state.users; 
        var showCalculates = this.state.rollingRetentionXday == "" ? "d-none" : "d-flex";
        var btnCalculateColor = this.state.rollingRetentionXday == "" ? "btn-primary" : "btn-warning"
        return (
            <div className="container mb-3">
                <div className="row">
                    <Form onSubmit={(e) => { this.onSubmit(e, users) }}>
                        <table className='table table-light table-borderless table-responsive' aria-labelledby="tabelLabel">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="text-muted text-center text-uppercase">ID</th>
                                    <th className="text-muted text-center text-uppercase">Date Registration</th>
                                    <th className="text-muted text-center text-uppercase">Date Last Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user =>
                                    <tr key={user.id}>
                                        <td>
                                            <input type="button" className="btn btn-light DeleteUserBtn" value=" "
                                                onClick={() => this.deleteUser(user.id)} />
                                        </td>
                                        <td>
                                            <input type="text"
                                                readOnly
                                                className={"DisabledInput RoundedInput form-control-plaintext"}
                                                defaultValue={user.id}/>
                                        </td>
                                        <td>

                                            <Input type="date"
                                                className={"RoundedInput"}
                                                defaultValue={user.registrationDate}
                                                onChange={(e) => this.onFieldChange(e, user.id)}
                                                name="registrationDate"
                                                required
                                            />
                                        </td>
                                        <td>
                                            <Input type="date"
                                                className={"RoundedInput"}
                                                defaultValue={user.lastActivity}
                                                onChange={(e) => this.onFieldChange(e, user.id)}
                                                name="lastActivity"
                                                required
                                            />
                                        </td>
                                    </tr>
                                )}
                                <tr>

                                    <td>
                                        <input type="button" className="btn btn-light AddUserBtn" value=" " onClick={this.addUser} />
                                    </td>
                                    <td></td>
                                    <td>
                                        <Input type="date"
                                            className={"RoundedInput"}
                                            onChange={this.onNewUserRegistrationChange} />
                                    </td>
                                    <td>
                                        <Input type="date"
                                            className={"RoundedInput"}
                                            onChange={this.onNewUserActivityChange} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="row">
                            <div className="d-flex justify-content-center">
                                <input type="submit" className="btn btn-primary RoundedButton me-1" value="SAVE" />
                                <input type="button" className={"btn ms-1 RoundedButton " + btnCalculateColor} value="CALCULATE" onClick={() => this.calculate(users)} />
                            </div>
                        </div>
                    </Form>
                </div>

                <div className={"row mt-3 border rounded " + showCalculates}>
                    <div className="col-12 d-flex justify-content-center">Rolling Retention 7 day = {this.state.rollingRetentionXday}%</div>
                    <HistogramChart className="col-12" data={this.state.lifeTimeData} />
                </div>
            </div>
        );
    }


}

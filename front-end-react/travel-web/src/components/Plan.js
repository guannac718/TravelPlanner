import React from 'react';
import {DrawPath} from './GoogleMapPath.js'
import {PATH_ZOOM, API_KEY, API_ROOT, USER_ID, TOKEN_KEY, AUTH_HEADER} from "../constants.js"
import {Attractions} from './Attractions';
import {OverviewButton} from './OverviewButton';
import { message, Button} from "antd";
import {SpotsList} from './SpotsList';
import smartPost from 'react-smart-post';
import {withRouter  } from 'react-router-dom'

class MyPlan extends React.Component {
    state = {
        path: [],
        ithDay: 1,
        plans: [],
        prevPath: [],
        temp: [],
        spotNum: 0,
    }

    changePlans = (newPlan) =>{
        this.setState({plans:newPlan}, ()=>console.log(this.state.plans))
    }

    changePath = (path, ithDay)=>{
        if(ithDay===undefined){
            ithDay=this.state.ithDay
        }
        this.setState({
            ithDay,
            path
        })
    }

    chooseday = (ithday) => {
        message.info(`ヾ(◍°∇°◍)ﾉﾞ   Changed to Day ${ithday}`);
        this.setState({
            ithDay: ithday,
            path : this.state.plans[ithday-1],
        },()=>{
            console.log(this.state.path);
        });
        return;
    };

    getSortedList = (path) => {
        let nameArray = path.map( (spotItem) => {
            return spotItem.props.children
        });
        // console.log("nameArray: ", nameArray);
        let spotObjArray = []
        nameArray.map(spotName => {
            let originPath = this.SpotsListRef.state.path;
            const spotObj = originPath.find((element) => (element.name === spotName))
            spotObjArray.push(spotObj);
        });
        console.log("spotObjArray:", spotObjArray);
        console.log(spotObjArray);
        return spotObjArray
    }

    generateRoute = () => {
        this.refreshTodayPath();
        // console.log("tempInit:", this.state.temp);
    }

    getSpotsListRef = (ref) => {
        this.SpotsListRef = ref;
    }

    // removeRoute = () => {
    //     this.setState((state) => ({path: []}))
    // }

    componentWillMount() {
        // attention
        smartPost.push(this);
    }

    getplaceId = (id) => {
        this.setState({placeId: id});
    }

    addOneDay = () => {
        this.setState({ithDay: this.state.plans.length + 1, path: []});
        this.setState(prevState => {
                return {
                    plans: [
                        ...prevState.plans,
                        []
                    ]
                };
            },
            // () => console.log("add one more day", this.state.path, this.state.plans, this.state.ithDay)
        );
    }

    saveToDB=(path, ithDay)=>{
        const token = localStorage.getItem(TOKEN_KEY);
        const user_id = localStorage.getItem(USER_ID);
        const results= path.map((data)=>{
            // console.log(data)
            return {
                geometry: {location: data.location},
                name : data.name,
                place_id : data.place_id,
            }
        });
        const body ={
            results ,
            user_id ,
            ithDay ,
        }
        // console.log("path JSON ", body);

        return fetch(`${API_ROOT}/saveroutes`, {
            method: 'POST',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                if (response.ok) {
                    message.success(`(๑•̀ㅂ•́)و✧  Save route successfully for day ${ithDay}!`);
                    return;
                }
                throw new Error('Failed to connect to database.');
            })
            .catch((e) => {
                console.error(e);
                message.error('w(ﾟДﾟ)w  Failed to save route.');
            });
    }

    refreshTodayPath = () => {
        const newpath = [];
        const newOrder = this.SpotsListRef.returnSpotsList().map((a)=>(parseInt(a.key)));
        console.log(newOrder);
        for(let i = 0 ; i < newOrder.length; i++){
            newpath.push(1);
        }
        for(let i = 0 ; i < newOrder.length; i++){
            newpath[i]=this.state.path[newOrder[i]];
        }
        this.modifyPath(newpath);
        return newpath;
    }

    clickSaveToday = (path) => {
        // debugger;
        const ithDay = this.state.ithDay
        const newpath = this.refreshTodayPath();
        this.saveToDB(newpath, ithDay);
        console.log(path);
    }

    planRemoveIdx = (idx)=>{
        const {plans} = this.state;
        const newplans = [ ...plans.slice(0,idx), ...plans.slice(idx+1)];
        this.setState(({plans})=>({
            plans:newplans
        }));
        this.setState({path:[]})
    }

    modifyPath = (newPath)=>{
        // console.log(newPath);
        const {ithDay, plans} = this.state;
        this.setState({path: newPath});
        const newplans = [...plans.slice(0, ithDay-1), newPath, ...plans.slice(ithDay)];
        // this.setState({plans: newplans}, ()=>console.log(this.state.plans));
        this.setState(({plans})=>({plans: newplans}), ()=>console.log(this.state.plans));
    }

    componentDidMount() {
        fetch(`${API_ROOT}/history?user_id=${localStorage.getItem(USER_ID)}`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${localStorage.getItem(TOKEN_KEY)}`
            },
        })
        .then((response)=>{
            if(response.ok){
                message.success('n(*≧▽≦*)n   Get your route successfully!');
                return response.json();
            }
            throw new Error('No history routes for this username.');
        }).then(
            (history)=>{
                console.log("history in plan: ", history);
                this.setState({ plans: history});
                if(history.length){
                    this.setState({path: history[0]});
                    this.SpotsListRef.setState({path: history[0]});
                }
            }
        ).catch((e) => {
            console.log(e)
            message.error('w(ﾟДﾟ)w  Failed to get history.');
        });

    }

    recommendRoute = (path, ithDay) => {
        // debugger
        const body ={
            route : path.map((data)=>{
                // console.log(data)
                return {
                    geometry: {location: data.location},
                    name : data.name,
                    place_id : data.place_id,
                }
            }),
            ithDay: ithDay,
        }

        fetch(`${API_ROOT}/recommend?`, {
            method: 'POST',
            headers: {
                Authorization: `${AUTH_HEADER} ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify(body),
        })
            .then((response)=>{
                if(response.ok){
                    message.success('n(*≧▽≦*)n   Get your recommend route successfully!');
                    return response.json();
                }
                throw new Error('Faile to get recommend route.');
            }).then(
            (data)=>{
                console.log("recommend: ",data);
                this.setState({ path: data.route });
            }
        ).catch((e) => {
            console.log(e)
            message.error('(⊙x⊙;)   No recommend routes for this date.');
        });

    }

    getAttractionRef = (ref) => {
        this.attractionRef = ref;
    }

    selectSpot = () => {
        this.attractionRef.handleSearchById();

    }

    backToCity = () =>{
        this.props.history.push({
            pathname: `/city`
        })
    }

    deletePlan = (idx) =>{
        const ithDay = idx+1;
        const user_id = localStorage.getItem(USER_ID);
        const body = {ithDay, user_id};
        const token = localStorage.getItem(TOKEN_KEY);
        fetch(`${API_ROOT}/saveroutes`,{
            method: 'DELETE',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                if (response.ok) {
                    message.success(`(๑•̀ㅂ•́)و✧  Delete route successfully for day ${ithDay}!`);
                    return;
                }
                throw new Error('Failed to connect to database.');
            })
            .catch((e) => {
                console.error(e);
                message.error('w(ﾟДﾟ)w  Failed to delete route.');
            });
        this.planRemoveIdx(idx);
    }


    render() {
        const ithday = this.state.ithDay;
        // console.log(this.state.path);
        const path = this.state.path.map((place) => (
            {
                latlng: place.location,
                place_id: place.place_id,
                name: place.name,
            }
        ));
        // debugger
        return (
            <div className="planContainer">
                <div className="leftContent">
                    <OverviewButton
                        plans={this.state.plans}
                        setDay={this.chooseday}
                        planRemoveIdx={this.planRemoveIdx}
                        changePlans={this.changePlans}
                        changePath={this.changePath}
                        saveToDB={this.saveToDB}
                    />
                    <Button onClick={() => {this.clickSaveToday(this.state.path)}}
                            className="btn-3d" icon="save">
                        Save Plan for this day
                    </Button>
                    <div className="show-plan">
                        <h3>{this.state.plans.length ? `Day ${ithday}` : `No plan`}</h3>
                        <SpotsList
                            ref={this.getSpotsListRef}
                            path={this.state.path}
                            modifyPath={this.modifyPath}
                            changePath={this.changePath}
                        />
                    </div>
                    <Button onClick={this.addOneDay} className="btn-3d" icon="plus"  >
                        Add One More Day
                    </Button>

                    <Button type="dashed" onClick={()=>this.deletePlan(this.state.ithDay-1)} className="btn-3d" icon="delete">Delete Today's Plan</Button>
                    <Button type="primary" onClick={this.backToCity} className="btn-3d" icon="rollback">Back to Choose City</Button>
                </div>
                <div className="path">
                    <Button type="primary" htmlType="submit" onClick={this.selectSpot} className="btn-3d" icon="message">Insert My Spot</Button>

                    <Button type="primary" htmlType="submit" onClick={this.generateRoute} className="btn-3d" icon="edit">Generate
                        Route</Button>
                    <Button type="primary" htmlType="submit" onClick={() => {this.recommendRoute(this.state.path, this.state.ithDay)}} className="btn-3d" icon="radar-chart">Recommend
                        Route</Button>

                    {/*<Button type="primary" htmlType="submit" onClick={this.removeRoute} className="btn-3d red" icon="delete">Remove*/}
                    {/*    Route</Button>*/}
                    <DrawPath
                        getMapRef={this.getMapRef}
                        path={path}
                        getplaceId={this.getplaceId}

                        city={this.props.city ? this.props.city : this.state.path[0]}
                        zoom={PATH_ZOOM}

                        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=3.exp&libraries=geometry,drawing,places`}
                        loadingElement={<div style={{height: `100%`}}/>}
                        containerElement={<div style={{height: `750px`}}/>}
                        mapElement={<div style={{height: `100%`}}/>}
                    />
                </div>
                <div className = "rightContent">
                    <Attractions
                        ref={this.getAttractionRef}
                        city={this.props.city ? this.props.city : this.state.path[0]}
                        userSearchId={this.state.placeId}
                    />
                </div>
            </div>
        )
    }
}

export const Plan = withRouter(MyPlan)
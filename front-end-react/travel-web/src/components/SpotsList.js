import React from 'react';
import PropTypes from 'prop-types';
import ListSort from './ListSort';
import PubSub from 'pubsub-js';

import '../styles/SpotsList.css';
import {Icon} from "antd"

export class SpotsList extends React.Component {
    state = {
        path: [],
    }
    static propTypes = {
        className: PropTypes.string,
    };

    static defaultProps = {
        className: 'list-sort-demo',
    };

    componentDidMount() {
        this.pubsub_token = PubSub.subscribe('path', (path, spot) => {
            const {name, place_id, location} = spot;
            // debugger
            // const lat=location.lat, lng = location.lng;
            let newPath = this.state.path.concat({name, place_id, location});
            this.setState({
                    path: newPath
                });
            this.props.modifyPath(newPath);
        })
    }


    componentWillUnmount() {
        PubSub.unsubscribe(this.pubsub_token);
    }


    getListSort = (ref) => {
        this.sortListRef = ref;
    }

    returnSpotsList = () => {
        return this.sortListRef.returnList();
    }

    remove = (idx) => {
        let {path} = this.state;
        let newPath = [...path.slice(0, idx), ...path.slice(idx + 1)];
        this.setState({
            path: newPath
        });
        this.props.changePath(newPath);
    }

    static getDerivedStateFromProps(props, state){
        return { path: props.path };
    }


    render() {
        const childrenToRender = this.state.path.map((item, index) => {
            const {name} = item;
            return (
                <div key={index} className={`${this.props.className}-list`}>
                    {name}
                    {/*{item}*/}
                </div>
            )
        });

        const deletes = this.state.path.map((content, idx) => (
            <div key={idx}>
                <Icon
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                    onClick={() => this.remove(idx)}
                />
            </div>
        ))

        return (
            <div className={`${this.props.className}-div ${this.props.className}-wrapper planOverView`}>
                <div>{deletes}</div>
                <div className="spotPath">
                    <ListSort ref={this.getListSort}
                              dragClassName="list-drag-selected"
                              appearAnim={{animConfig: {marginTop: [5, 30], opacity: [1, 0]}}}
                    >
                        {childrenToRender}
                    </ListSort>
                </div>
            </div>
        );
    }
}




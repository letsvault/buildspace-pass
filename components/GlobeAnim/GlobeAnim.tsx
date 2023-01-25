// import type { NextPage } from "next";
// import "./GlobeAnim.css";
// import style from "./GlobeAnim.module.css"

import * as React from 'react';
// import gsap from "gsap";
import ProfilesPlate from '../ProfilesPlate/ProfilesPlate';
import { mainAnim } from "./animation"



// const GlobeAnim = () => {
class GlobeAnim extends React.Component {

  componentDidMount() {
    mainAnim("#mainAnimContainer", () => { console.log("loaded"); })

  };

  render() {

    return (
      <div className="dfrnc-container">
        <div className="container-canvas" id="mainAnimContainer" data-model="./models/"></div>
        <ProfilesPlate />
      </div>
    );
  }


}

export default GlobeAnim;
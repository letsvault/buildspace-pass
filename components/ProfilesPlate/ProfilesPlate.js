import React from 'react';
import { profilesData } from "./profiles"



class ProfilesPlate extends React.Component {


  AddProfile = function (data) {
    return (
      <>
        {data.data.map((elem, index) => {

          return (
            <div className={`profile profile--${index}`} key={index} data-profile-index={index} >
              <div className="profile__border"></div>
              <div className="profile__conainer" style={{ background: `${elem.bgColor}` }}>
                <div className="profile__top-row">
                  <div className="profile__foto">
                    <img src={elem.fotoUrl} alt={elem.fotoUrl} />
                  </div>
                  <div className="profile__info">
                    <div className="profile__info-name">{elem.name}</div>
                    <div className="profile__info-status">{elem.status}</div>
                    {elem.accessPass.map((accessPass, i) => {
                      return (
                        <div className="profile__info-access" key={i}>{accessPass}</div>
                      )
                    })}
                  </div >
                </div >
                <div className="profile__items">
                  <div className="profile__item">
                    <div className="profile__item-icon">
                      <img src={elem.cityIconUrl} alt="" />
                    </div>
                    <div className="profile__item-text">{elem.city}, {elem.country}</div>
                  </div>
                  <div className="profile__item">
                    <div className="profile__item-icon">
                      <img src={elem.currentRoleIconUrl} alt="" />
                    </div>
                    <div className="profile__item-text">{elem.currentRole}</div>
                  </div>
                  <div className="profile__item">
                    <div className="profile__item-icon">
                      <img src={elem.interestsIconUrl} alt="" />
                    </div>
                    <div className="profile__item-text">{elem.interests}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
        }
      </>
    );


  };

  render() {

    return (
      <div className="profiles" id="profilesForGlobe">
        <div className="profiles__close"></div>
        <this.AddProfile data={profilesData} />
      </div>
    );
  }
}



export default ProfilesPlate;
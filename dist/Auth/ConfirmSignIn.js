/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import React from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { Auth, I18n, Logger, JS } from 'aws-amplify';
import { AmplifyButton, FormField, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece from './AuthPiece';
import TEST_ID from '../AmplifyTestIDs';
import { getUniqueId, getManufacturer,getDevice, getDeviceName, getSystemVersion, getSystemName, getModel, isTablet  } from 'react-native-device-info'

const logger = new Logger('ConfirmSignIn');

export default class ConfirmSignIn extends AuthPiece {
	constructor(props) {
		super(props);

		this._validAuthStates = ['confirmSignIn'];
		this.state = {
			code: null,
			error: null,
			loading: false
		};

		this.confirm = this.confirm.bind(this);
		this.checkContact = this.checkContact.bind(this);
		this.sendPinAgain= this.sendPinAgain.bind(this)
	}

	

	async confirm() {
		const user = this.props.authData;
		const { code } = this.state;
		this.setState({loading: true});
		logger.debug('Confirm Sign In for ' + user.username);
		// Auth.sendCustomChallengeAnswer(user, code).then(data => {
		// 	this.checkContact(user)
		// }).catch(err => {
		// 	console.log("wrong pinn", err)
		// 	if(err.code === "NotAuthorizedException"){
		// 		this.changeState('signIn')
		// 	}
		// 	this.error("Wrong PIN!")
		// 	this.setState({loading: false});
		// })

		try{
			const usr = await Auth.sendCustomChallengeAnswer(user, JSON.stringify({
        type: "PIN", 
        message: code 
			}))
			// if device verifier let it go down
			if(usr.challengeParam.challengeMetadata==="PIN_VERIFIER"){
				this.error(I18n.get("WrongPIN"))
				return this.setState({loading: false});
			}
			this.checkContact(user)
		} catch(err){
			console.log("wrong pinnnnnnnnnn", err)
			if(err.code === "NotAuthorizedException"){
				this.changeState('signIn')
			}
			return this.setState({loading: false});
		}

		function capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1)
		}
	
		const phoneInfo = {
			deviceId: getUniqueId(),
			os: getSystemName() + ' ' + getSystemVersion(),
			isTablet: isTablet(),
		}
		user.getCachedDeviceKeyAndPassword(); // without this line, the deviceKey is null
		console.log("DEVICEEEEEEEEEEEEEEEEEEEE",user.deviceKey);
		phoneInfo.cognitoKey = user.deviceKey
		
		const deviceName = await getDeviceName()
		const manufacturer = await getManufacturer()
		phoneInfo.deviceName = deviceName
		phoneInfo.model = capitalizeFirstLetter(manufacturer) + ' ' + getModel()
		console.log("PO DERGON DEVICIN")
		try{
			await Auth.sendCustomChallengeAnswer(user, JSON.stringify({
        type: "DEVICE", 
        message: phoneInfo 
      }))
			this.checkContact(user)
			this.setState({loading: false})
			console.log("DEVICE SUSCCSESS")
		} catch(err){
			// Alert.alert(
			// 	'You are not Authorized!',
			// 	'You are not authorized, to accses the next screen! (ui+ux is needed)',
			// );
			console.log("wrong deviceeeEEEEEEEEEEeee", err)
			if(err.code === "NotAuthorizedException"){
				this.changeState('signIn', {
					error: I18n.get("NotAuthorized")
				})
			}
			// this.error("You are not authorized!")
			return this.setState({loading: false});
		}

	}

	sendPinAgain () {
		const user = this.props.authData;
		console.log("ERDHI TEK SEND PINAGIAN")
		this.setState({loading: true});
		Auth.sendCustomChallengeAnswer(user, JSON.stringify({
			type: "RESEND_PIN", 
		})).then(data => {
			console.log("SUCSSSESSS TEK SEND PINAGIAN")

			this.setState({loading: false});
		}).catch(err => {
			console.log("ERRORRR sind pin again", err)
			if(err.code === "NotAuthorizedException"){
				this.changeState('signIn')
			}
			console.log("wrong pin TEK SEND PINAGIAN", err)
			this.error("Something went wrong, couldn't resend PIN!")
			this.setState({loading: false});
		});
	}

	showComponent(theme) {
		return React.createElement(
			Wrapper,
			null,
			React.createElement(
				View,
				{ style: theme.section },
				React.createElement(
					View,
					null,
					React.createElement(
						Header,
						{ theme: theme, testID: TEST_ID.AUTH.CONFIRM_SIGN_IN_TEXT },
						I18n.get('Confirm Sign In')
					),
					React.createElement(
						View,
						{ style: theme.sectionBody },
						React.createElement(FormField, {
							theme: theme,
							onChangeText: text => this.setState({ code: text }),
							label: I18n.get('Confirmation Code'),
							placeholder: I18n.get('Enter your confirmation code'),
							required: true,
							testID: TEST_ID.AUTH.CONFIRMATION_CODE_INPUT
						}),
						React.createElement(AmplifyButton, {
							theme: theme,
							text: this.state.loading ? <ActivityIndicator color="#fff" size="small" style={{width: 10, height: 20}} /> : I18n.get('Confirm'),
							onPress: this.confirm,
							disabled: !this.state.code,
							testID: TEST_ID.AUTH.CONFIRM_BUTTON
						})
					),
					React.createElement(
						View,
						{ style: theme.sectionFooter },
						React.createElement(
							LinkCell,
							{
								theme: theme,
								onPress: this.sendPinAgain,
								testID: TEST_ID.AUTH.BACK_TO_SIGN_IN_BUTTON
							},
							I18n.get('Send Pin Again')
						),
						React.createElement(
							LinkCell,
							{
								theme: theme,
								onPress: () => this.changeState('signIn'),
								testID: TEST_ID.AUTH.BACK_TO_SIGN_IN_BUTTON
							},
							I18n.get('Back to Sign In')
						)
					),
					React.createElement(
						ErrorRow,
						{ theme: theme },
						this.state.error
					)
				),
				React.createElement(SignedOutMessage, this.props)
			)
		);
	}
}
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
import { View, ActivityIndicator } from 'react-native';
import { Auth, I18n, Logger, JS } from 'aws-amplify';
import { AmplifyButton, FormField, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece from './AuthPiece';
import TEST_ID from '../AmplifyTestIDs';
import AmplifyTheme from '../AmplifyTheme';


const logger = new Logger('ConfirmSignIn');

export default class ChangePassword extends AuthPiece {
	constructor(props) {
		super(props);

		this._validAuthStates = ['changePassword'];
		this.state = {
			code: null,
			error: null,
			loading: false
		};

		this.confirm = this.confirm.bind(this);
		// this.checkContact = this.checkContact.bind(this);
		// this.sendPinAgain= this.sendPinAgain.bind(this)
	}

	async confirm() {
		const { currentPassword, newPassword, confirmPassword } = this.state;
    this.setState({loading: true});
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(
        currentUser,
        currentPassword,
        newPassword
      );
			this.setState({loading: false});
      this.props.goBack()
    } catch (error) {
      this.error(error)
      console.log(error)
      this.setState({loading: false});
    }
		// logger.debug('Confirm Sign In for ' + user.username);
		// Auth.sendCustomChallengeAnswer(user, code).then(data => {
		// 	this.checkContact(user)
		// 	this.setState({loading: false});
		// }).catch(err => {
		// 	console.log("wrong pinn", err)
		// 	if(err.code === "NotAuthorizedException"){
		// 		this.changeState('signIn')
		// 	}
		// 	this.error("Wrong PIN!")
		// 	this.setState({loading: false});
		// });
	}

	// sendPinAgain () {
	// 	const user = this.props.authData;
	// 	console.log("ERDHI TEK SEND PINAGIAN")
	// 	this.setState({loading: true});
	// 	Auth.sendCustomChallengeAnswer(user, "RESEND_PIN").then(data => {
	// 		console.log("SUCSSSESSS TEK SEND PINAGIAN")

	// 		this.setState({loading: false});
	// 	}).catch(err => {
	// 		console.log("ERRORRR sind pin again", err)
	// 		if(err.code === "NotAuthorizedException"){
	// 			this.changeState('signIn')
	// 		}
	// 		console.log("wrong pin TEK SEND PINAGIAN", err)
	// 		this.error("Something went wrong, couldn't resend PIN!")
	// 		this.setState({loading: false});
	// 	});
	// }

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
						I18n.get('Change your password')
					),
					React.createElement(
						View,
						{ style: theme.sectionBody },
						React.createElement(FormField, {
							theme: theme,
							onChangeText: text => this.setState({ currentPassword: text }),
							label: I18n.get('Current password'),
							placeholder: I18n.get('Enter your current password'),
              required: true,
              secureTextEntry: true,
							testID: TEST_ID.AUTH.CONFIRMATION_CODE_INPUT
            }),
            React.createElement(FormField, {
							theme: theme,
							onChangeText: text => this.setState({ newPassword: text }),
							label: I18n.get('New Password'),
							placeholder: I18n.get('Enter your new password'),
              required: true,
              secureTextEntry: true,
							testID: TEST_ID.AUTH.CONFIRMATION_CODE_INPUT
            }),
            React.createElement(FormField, {
							theme: theme,
							onChangeText: text => this.setState({ confirmPassword: text }),
							label: I18n.get('Confirm password'),
							placeholder: I18n.get('Confirm your new password'),
              required: true,
              secureTextEntry: true,
							testID: TEST_ID.AUTH.CONFIRMATION_CODE_INPUT
						}),
						React.createElement(AmplifyButton, {
							theme: theme,
							text: this.state.loading ? <ActivityIndicator color="#fff" size="small" style={{width: 10, height: 20}} /> : I18n.get('Confirm'),
							onPress: this.confirm,
              disabled: !this.state.currentPassword 
              // || this.state.currentPassword.length<8
              || !this.state.newPassword
              || !this.state.confirmPassword 
              // || this.state.confirmPassword.length<8
              || this.state.newPassword !== this.state.confirmPassword,
							testID: TEST_ID.AUTH.CONFIRM_BUTTON
						})
					),
					React.createElement(
						ErrorRow,
						{ theme: theme },
						this.state.error
					)
				),
				// React.createElement(SignedOutMessage, this.props)
			)
		);
  }
  
  render() {
		// if (!this._validAuthStates.includes(this.props.authState)) {
		// 	this._isHidden = true;
		// 	return null;
		// }

		// if (this._isHidden) {
		// 	const { track } = this.props;
		// 	if (track) track();
		// }
		// this._isHidden = false;

		return this.showComponent(this.props.theme || AmplifyTheme);
	}
}
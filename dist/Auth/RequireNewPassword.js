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
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import { FormField, AmplifyButton, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece from './AuthPiece';
import TEST_ID from '../AmplifyTestIDs';

const logger = new Logger('RequireNewPassword');

export default class RequireNewPassword extends AuthPiece {
	constructor(props) {
		super(props);

		this._validAuthStates = ['requireNewPassword'];
		this.state = {
			password: null,
			error: null,
			requiredAttributes: {}
		};

		this.change = this.change.bind(this);
	}

	change() {
		const user = this.props.authData;
		const { password, requiredAttributes } = this.state;
		this.setState({loading: true});
		logger.debug('Require new password for ' + user.username);
		Auth.completeNewPassword(user, password, requiredAttributes).then(user => {
			if (user.challengeName === 'SMS_MFA') {
				this.changeState('confirmSignIn', user);
			} else {
				this.checkContact(user);
			}
			this.setState({loading: true});
		}).catch(err => {
			this.error(err)
			this.setState({loading: true});
		});
	}

	generateForm(attribute, theme) {
		return React.createElement(FormField, {
			theme: theme,
			onChangeText: text => {
				const attributes = this.state.requiredAttributes;
				if (text !== '') attributes[attribute] = text;else delete attributes[attribute];
				this.setState({ requiredAttributes: attributes });
			},
			label: I18n.get(convertToPlaceholder(attribute)),
			key: I18n.get(convertToPlaceholder(attribute)),
			placeholder: I18n.get(convertToPlaceholder(attribute)),
			required: true
		});
	}

	showComponent(theme) {
		const user = this.props.authData;
		const { requiredAttributes } = user.challengeParam;
		return React.createElement(
			Wrapper,
			null,
			React.createElement(
				ScrollView,
				{ style: theme.sectionScroll },
				React.createElement(
					Header,
					{ theme: theme, testID: TEST_ID.AUTH.CHANGE_PASSWORD_TEXT },
					I18n.get('Change Password')
				),
				React.createElement(
					View,
					{ style: theme.sectionBody },
					React.createElement(FormField, {
						theme: theme,
						onChangeText: text => this.setState({ password: text }),
						label: I18n.get('Password'),
						placeholder: I18n.get('Enter your password'),
						secureTextEntry: true,
						required: true
					}),
					requiredAttributes.map(attribute => {
						logger.debug('attributes', attribute);
						return this.generateForm(attribute, theme);
					}),
					React.createElement(AmplifyButton, {
						text: this.state.loading ? <ActivityIndicator color="#fff" size="small" style={{width: 10, height: 20}} /> : I18n.get('Change Password'),
						onPress: this.change,
						theme: theme,
						disabled: !(this.state.password && Object.keys(this.state.requiredAttributes).length === Object.keys(requiredAttributes).length)
					})
				),
				React.createElement(
					View,
					{ style: theme.sectionFooter },
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
				),
				React.createElement(SignedOutMessage, this.props)
			)
		);
	}
}

function convertToPlaceholder(str) {
	return str.split('_').map(part => part.charAt(0).toUpperCase() + part.substr(1).toLowerCase()).join(' ');
}
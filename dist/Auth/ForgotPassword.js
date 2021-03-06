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
import { View } from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import { FormField, AmplifyButton, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece from './AuthPiece';
import TEST_ID from '../AmplifyTestIDs';

const logger = new Logger('ForgotPassword');

export default class ForgotPassword extends AuthPiece {
	constructor(props) {
		super(props);

		this._validAuthStates = ['forgotPassword'];
		this.state = { delivery: null };

		this.send = this.send.bind(this);
		this.submit = this.submit.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		const username = props.authData;

		if (username && !state.username) {
			return { username };
		}

		return null;
	}

	send() {
		const username = this.getUsernameFromInput();
		if (!username) {
			this.error('Username cannot be empty');
			return;
		}
		Auth.forgotPassword(username).then(data => {
			logger.debug(data);
			this.setState({ delivery: data.CodeDeliveryDetails });
		}).catch(err => this.error(err));
	}

	submit() {
		const { code, password } = this.state;
		const username = this.getUsernameFromInput();
		Auth.forgotPasswordSubmit(username, code, password).then(data => {
			logger.debug(data);
			this.changeState('signIn');
		}).catch(err => this.error(err));
	}

	forgotBody(theme) {
		return React.createElement(
			View,
			{ style: theme.sectionBody },
			this.renderUsernameField(theme),
			React.createElement(AmplifyButton, {
				text: I18n.get('Send').toUpperCase(),
				theme: theme,
				onPress: this.send,
				disabled: !this.getUsernameFromInput(),
				testID: TEST_ID.AUTH.SEND_BUTTON
			})
		);
	}

	submitBody(theme) {
		return React.createElement(
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
			React.createElement(FormField, {
				theme: theme,
				onChangeText: text => this.setState({ password: text }),
				label: I18n.get('Password'),
				placeholder: I18n.get('Enter your new password'),
				secureTextEntry: true,
				required: true,
				testID: TEST_ID.AUTH.PASSWORD_INPUT
			}),
			React.createElement(AmplifyButton, {
				text: I18n.get('Submit'),
				theme: theme,
				onPress: this.submit,
				disabled: !(this.state.code && this.state.password),
				testID: TEST_ID.AUTH.SUBMIT_BUTTON
			})
		);
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
						{ theme: theme, testID: TEST_ID.AUTH.FORGOT_PASSWORD_TEXT },
						I18n.get('Reset your password')
					),
					React.createElement(
						View,
						{ style: theme.sectionBody },
						!this.state.delivery && this.forgotBody(theme),
						this.state.delivery && this.submitBody(theme)
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
					)
				),
				React.createElement(SignedOutMessage, this.props)
			)
		);
	}
}
import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Router from 'next/router';
import Form from './styles/Form';
import Error from './ErrorMessage';

import { CURRENT_USER_QUERY } from './User';


const RESET_PASSWORD_MUTATION = gql`
    mutation RESET_PASSWORD_MUTATION(
        $resetToken: String!
        $password: String!
        $confirmPassword: String!
    ) {
        resetPassword(
            resetToken: $resetToken
            password: $password
            confirmPassword: $confirmPassword
        ) {
            id
            email
            name
        }
    }
`;

class Reset extends Component {

    static propTypes = {
        resetToken: PropTypes.string.isRequired,
    };

    state = {
        password: '',
        confirmPassword: ''
    };

    saveToState = (e) => {
        const { name, type, value } = e.target;
        const val = (type === 'number') ? parseFloat(value) : value;
        this.setState({ [name]: val });
    };

    render() {
        return (
            <Mutation 
                mutation={RESET_PASSWORD_MUTATION} 
                variables={{
                    resetToken: this.props.resetToken, 
                    password: this.state.password,
                    confirmPassword: this.state.confirmPassword
                }} 
                refetchQueries={[
                    { query: CURRENT_USER_QUERY }
                ]}
            >
                {(resetPassword, { loading, error, called }) => (
                    <Form method="post" onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await resetPassword();
                        this.setState({
                            password: '',
                            confirmPassword: ''
                        });
                    }}>
                        <Error error={error}/>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2>Reset Password {this.props.resetToken}</h2>
                            {!error && !loading && called && 
                                <p>Success! Your password has been reset!</p>
                            }
                            <label htmlFor="password">
                                Password
                                <input type="password" id="password" name="password" placeholder="Password" value={this.state.password} onChange={this.saveToState} required />
                            </label>

                            <label htmlFor="confirmPassword">
                                Confirm Password
                                <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" value={this.state.confirmPassword} onChange={this.saveToState} required />
                            </label>
        
                            <button type="submit">Reset Password!</button>
                        </fieldset>
                    </Form>
                )}
            </Mutation>
        );
    }
};

export default Reset;
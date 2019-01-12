import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
    query CURRENT_USER_QUERY{
        me {
            id
            email
            name
            permissions
        }
    }
`;

//Allow us to gather the user information without having to wrap each component with the same query.
//We can simply wrap it with our User component and we can get the user info from there
const User = props => (
    <Query {...props} query={CURRENT_USER_QUERY}>
        {payload => props.children(payload)}
    </Query>
);

User.propTypes = {
    children: PropTypes.func.isRequired,
};

export default User;
export { CURRENT_USER_QUERY };
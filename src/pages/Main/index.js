import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  InputUser,
  SubmitButton,
  ListUser,
  User,
  UserAvatar,
  UserName,
  UserBio,
  ProfileButton,
  ProfileButtonText,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Users',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      newUser: '',
      users: [],
      loading: false,
      error: null,
    };
  }

  // use async cause we need load the data to render
  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');
    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  // don't need be async
  componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    try {
      const { users, newUser } = this.state;

      this.setState({ loading: true, error: false });

      const res = await api.get(`/users/${newUser}`);

      const selectedData = {
        name: res.data.name,
        login: res.data.login,
        bio: res.data.bio,
        avatar: res.data.avatar_url,
      };

      const hasUser = users.find(user => user.login === newUser);

      if (hasUser) throw new Error('User already listed');

      if (newUser === '') throw new Error("Insert GitHub user's login");

      this.setState({
        users: [...users, selectedData],
        newUser: '',
        loading: false,
      });

      Keyboard.dismiss(); // close keyboard after submit
    } catch (err) {
      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  render() {
    const { users, newUser, loading, error } = this.state;

    return (
      <Container>
        <Form>
          <InputUser
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="add User"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
            error={error}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>

        <ListUser
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <UserAvatar source={{ uri: item.avatar }} />
              <UserName>{item.name}</UserName>
              <UserBio>{item.bio}</UserBio>
              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>View Profile</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}

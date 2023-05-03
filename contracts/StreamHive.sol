// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./ERC20.sol";

/// @title Hello World
/// @notice This is an example Hello World implementation for education
contract StreamHive {
    // Define a struct to represent a post
    struct Post {
        uint256 postId;
        address creator; // The address of the user who created the post
        uint256 starTime;
        uint256 endTime;
        string playbackId;
        bool isLiveStream;
        string productLink;
    }

    // Define a struct to represent a user
    struct User {
        address userAddress;
        address[] following;
        address[] followers;
    }

    mapping(uint256 => Post) public posts;
    uint256 public postCount;

    // Define a mapping to store user data, keyed by user address
    mapping(address => User) public users;

    // Define a mapping user address to token
    mapping(address => address) public creatorTokens;

    // Define an event that will be emitted when a post is created
    event PostCreated(uint256 indexed postId, address indexed creator);

     // Define an event that will be emitted when a user follows another user
    event UserFollowed(address indexed follower, address indexed followee);

    event TokenCreated(address indexed token, address indexed owner);

    function createUser() public returns (User memory user) {
        address[] memory following;
        address[] memory followers;
        user = User(msg.sender, following, followers);
        users[msg.sender] = user;
    }

    // Create a new post
    function createPost(uint256 _startTime, uint256 _endTime, string memory _playbackId, bool _isLiveStream, string memory productLink) public returns (uint256) {
        // Increment the post count to generate a unique ID
        postCount++;

        // Create a new Post struct and add it to the mapping
        posts[postCount] = Post(postCount, msg.sender, _startTime, _endTime, _playbackId, _isLiveStream, productLink);

        // Emit a PostCreated event
        emit PostCreated(postCount, msg.sender);

        return postCount;
    }

    // Follow a user
    function followUser(address _userToFollow) public {
        // Get the User struct for the current user
        User storage user = users[msg.sender];

        User storage followee = users[_userToFollow];

        // Add the user to the following array
        user.following.push(_userToFollow);

        // Add the user to the followers array
        followee.followers.push(address(msg.sender));

        // Emit a UserFollowed event
        emit UserFollowed(msg.sender, _userToFollow);
    }

    function getFollowers(address _user) public view returns (address[] memory) {
        User storage user = users[_user];
        
        address[] memory followers = new address[](user.followers.length);
        
        for (uint i = 0; i < user.followers.length; i++) {
            followers[i] = user.followers[i];
        }

        return followers;
    }

    function getFollowing(address _user) public view returns (address[] memory) {
        User storage user = users[_user];
        
        address[] memory following = new address[](user.following.length);
        
        for (uint i = 0; i < user.following.length; i++) {
            following[i] = user.following[i];
        }
        
        return following;
    }

    function launchToken (string memory name_, string memory symbol_, uint256 _totalSupply) public returns (address) {
        StreamHiveCreatorToken token = new StreamHiveCreatorToken(
            name_,
            symbol_,
            _totalSupply,
            msg.sender
        );

        creatorTokens[msg.sender] = address(token);

        Ownable(token).transferOwnership(msg.sender);

        emit TokenCreated(address(token), msg.sender);

        return address(token);
    }
}
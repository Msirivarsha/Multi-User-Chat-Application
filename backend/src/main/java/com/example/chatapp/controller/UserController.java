@PostMapping("/login")
public String loginUser(@RequestBody User user) {
    Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
    
    // Check if the user exists
    if (existingUser.isPresent()) {
        // Check if the password matches
        if (existingUser.get().getPassword().equals(user.getPassword())) {
            return "Login successful!";
        } else {
            return "Invalid password!";
        }
    } else {
        return "Username not found!";
    }
}

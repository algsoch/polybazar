package com.polybazar.repository;

import com.polybazar.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndIsActiveTrue(String email);

    List<User> findByRole(User.UserRole role);

    List<User> findByKycStatus(User.KycStatus kycStatus);

    List<User> findByRoleAndKycStatus(User.UserRole role, User.KycStatus kycStatus);

    long countByRole(User.UserRole role);

    long countByKycStatus(User.KycStatus status);

    List<User> findByIsActiveTrue();

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?0, '$options': 'i' } }, { 'companyName': { '$regex': ?0, '$options': 'i' } } ] }")
    List<User> searchUsers(String query);
}

package com.example.demo.repository;
import com.example.demo.enums.BookingStatus;
import com.example.demo.model.Booking;
import com.example.demo.model.ParkingSpot;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    //Find booking by user (renter)
    List<Booking> findByRenter(User renter);

    //Find booking for a specific parking spot
    List<Booking> findBySpot(ParkingSpot spot);

    @org.springframework.data.jpa.repository.Query("""
    select (count(b) > 0) from Booking b
    where b.spot = :spot
      and b.status in :statuses
      and b.startTime <= :endTime
      and b.endTime >= :startTime
""")
    boolean hasOverlapForStatuses(
            @org.springframework.data.repository.query.Param("spot") ParkingSpot spot,
            @org.springframework.data.repository.query.Param("statuses") List<BookingStatus> statuses,
            @org.springframework.data.repository.query.Param("endTime") LocalDateTime endTime,
            @org.springframework.data.repository.query.Param("startTime") LocalDateTime startTime
    );

    List<Booking> findByStatus(BookingStatus status);

    Optional<Booking> findBySpotAndStatus(ParkingSpot spot, BookingStatus status);

    List<Booking> findByStatusAndStartTimeBefore(BookingStatus bookingStatus, LocalDateTime now);

    List<Booking> findByStatusAndEndTimeBefore(BookingStatus bookingStatus, LocalDateTime now);

    List<Booking> findByStatusAndSpot_CreatedByOrderByStartTimeAsc(BookingStatus status, User createdBy);


    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus bookingStatus, LocalDateTime cutoff);
}

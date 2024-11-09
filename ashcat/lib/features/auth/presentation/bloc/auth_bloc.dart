import 'package:bloc/bloc.dart';

abstract class AuthEvent {}

class CheckAuthStatus extends AuthEvent {}

class LoginEvent extends AuthEvent {}

class LogoutEvent extends AuthEvent {}

abstract class AuthState {}

class Unauthenticated extends AuthState {}

class Authenticated extends AuthState {}

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(Unauthenticated()) {
    
    on<CheckAuthStatus>((event, emit) {
      // emit
    });
    on<LoginEvent>((event, emit) {
      emit(Authenticated());
    });
    on<LogoutEvent>((event, emit) {
      emit(Unauthenticated());
    });
  }
}

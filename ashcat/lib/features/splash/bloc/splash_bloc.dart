import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

abstract class SplashEvent extends Equatable {
  const SplashEvent();

  @override
  List<Object> get props => [];
}

class NavigateToNextPage extends SplashEvent {}

abstract class SplashState extends Equatable {
  const SplashState();

  @override
  List<Object> get props => [];

}
  class SplashInitial extends SplashState {}
  class SplashNavigated extends SplashState {}

class SplashBloc extends Bloc<SplashEvent, SplashState> {
  SplashBloc() : super(SplashInitial()) {
    on<NavigateToNextPage>((event, emit) {
      emit(SplashNavigated());
    });
  }
}
